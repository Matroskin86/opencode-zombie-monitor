/**
 * OpenCode Zombie Monitor Plugin
 * Auto-detects and kills orphaned opencode processes
 * Supports: macOS and Linux
 */
import { exec } from "child_process"
import { promisify } from "util"
import { platform } from "os"

const execAsync = promisify(exec)
const isMac = platform() === "darwin"

// Detect system language
const detectLang = () => {
  const lang = (process.env.LANG || process.env.LC_ALL || "").toLowerCase()
  if (lang.startsWith("ru")) return "ru"
  if (lang.startsWith("zh")) return "zh"
  return "en"
}

// Format memory size
const formatMB = (mb) => mb >= 1024 ? `${(mb / 1024).toFixed(1)}GB` : `${Math.round(mb)}MB`

// Localized messages
const i18n = {
  en: {
    killed: (n, mb) => `🧟 Killed ${n} zombie process${n > 1 ? "es" : ""} | Freed ${formatMB(mb)} RAM | Headshot! 💥`,
    found: (n, mb) => `🧟 ${n} zombie process${n > 1 ? "es" : ""} | ${formatMB(mb)} RAM | /kill-zombies`,
    status: (zombies, total, mb) => zombies > 0
      ? `🧟 ${zombies} zombie${zombies > 1 ? "s" : ""} of ${total} process${total > 1 ? "es" : ""} | ${formatMB(mb)} RAM | /kill-zombies`
      : `✅ ${total} process${total > 1 ? "es" : ""}, no zombies`,
    commandDesc: "Check zombie opencode processes",
    killDesc: "Kill zombie opencode processes",
    manualKilled: (n, mb) => `💥 Headshot! Killed ${n} zombie${n > 1 ? "s" : ""} | Freed ${formatMB(mb)} RAM`
  },
  ru: {
    killed: (n, mb) => `🧟 Убито ${n} зомби-процесс${n > 1 ? "ов" : ""} | Освобождено ${formatMB(mb)} RAM | Headshot! 💥`,
    found: (n, mb) => `🧟 ${n} зомби-процесс${n > 1 ? "ов" : ""} | ${formatMB(mb)} RAM | /kill-zombies`,
    status: (zombies, total, mb) => zombies > 0
      ? `🧟 ${zombies} зомби из ${total} процессов | ${formatMB(mb)} RAM | /kill-zombies`
      : `✅ ${total} процессов, зомби нет`,
    commandDesc: "Проверить зомби-процессы opencode",
    killDesc: "Убить зомби-процессы opencode",
    manualKilled: (n, mb) => `💥 Headshot! Убито ${n} зомби | Освобождено ${formatMB(mb)} RAM`
  },
  zh: {
    killed: (n, mb) => `🧟 已击杀 ${n} 个僵尸进程 | 释放 ${formatMB(mb)} 内存 | Headshot! 💥`,
    found: (n, mb) => `🧟 发现 ${n} 个僵尸进程 | ${formatMB(mb)} 内存 | /kill-zombies`,
    status: (zombies, total, mb) => zombies > 0
      ? `🧟 ${total} 个进程中有 ${zombies} 个僵尸 | ${formatMB(mb)} 内存 | /kill-zombies`
      : `✅ ${total} 个进程，没有僵尸`,
    commandDesc: "检查僵尸进程",
    killDesc: "击杀僵尸进程",
    manualKilled: (n, mb) => `💥 Headshot! 已击杀 ${n} 个僵尸 | 释放 ${formatMB(mb)} 内存`
  }
}

const t = i18n[detectLang()]

// Get zombie count and their total memory (RSS in MB)
const getZombieStats = async () => {
  try {
    const ttyPattern = isMac ? '??' : '?'
    // $6 = RSS in KB on both macOS and Linux
    const { stdout } = await execAsync(`ps aux | grep "[o]pencode" | grep -v "opencode/" | awk '$7 == "${ttyPattern}" {count++; mem+=$6} END {print count+0, mem/1024}'`)
    const [count, mb] = stdout.trim().split(/\s+/)
    return { count: parseInt(count) || 0, mb: parseFloat(mb) || 0 }
  } catch {
    return { count: 0, mb: 0 }
  }
}

// Count all opencode processes
const getTotalCount = async () => {
  try {
    const { stdout } = await execAsync('ps aux | grep "[o]pencode" | grep -v "opencode/" | wc -l')
    return parseInt(stdout.trim()) || 0
  } catch {
    return 0
  }
}

// Kill zombie processes (without terminal)
const killZombies = async () => {
  try {
    const ttyPattern = isMac ? '??' : '?'
    await execAsync(`ps aux | grep "[o]pencode" | grep -v "opencode/" | awk '$7 == "${ttyPattern}" {print $2}' | xargs kill -9 2>/dev/null`)
    return true
  } catch {
    return false
  }
}

// Configuration defaults
// autoKill: true = kill automatically, false = notify only (manual mode)
// threshold: minimum zombies to trigger action (1 = immediate)
const DEFAULT_CONFIG = {
  autoKill: true,
  threshold: 1
}

const sendNotification = async (client, sessionId, text) => {
  await client.session.prompt({
    path: { id: sessionId },
    body: {
      noReply: true,
      parts: [{ type: "text", text, ignored: true }]
    }
  })
}

const getSessionIdFromMessages = (messages) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.info?.role === "user" && messages[i]?.info?.sessionID) {
      return messages[i].info.sessionID
    }
  }
  return null
}

export const ZombieMonitor = async ({ client, config: pluginConfig }) => {
  let lastNotifiedCount = 0
  
  // Merge user config with defaults
  const cfg = { ...DEFAULT_CONFIG, ...pluginConfig }

  return {
    config: async (opencodeConfig) => {
      opencodeConfig.command = opencodeConfig.command || {}
      opencodeConfig.command["zombies"] = {
        template: "",
        description: t.commandDesc
      }
      opencodeConfig.command["kill-zombies"] = {
        template: "",
        description: t.killDesc
      }
    },

    "experimental.chat.messages.transform": async (input, output) => {
      const sessionId = getSessionIdFromMessages(output.messages)
      if (!sessionId) return

      const { count: zombies, mb } = await getZombieStats()
      
      // Auto-kill if enabled and zombies >= threshold
      if (cfg.autoKill && zombies >= cfg.threshold) {
        await killZombies()
        try {
          await sendNotification(client, sessionId, t.killed(zombies, mb))
        } catch (e) {}
        lastNotifiedCount = 0
      }
      // Notify if zombies appeared (manual mode or below threshold)
      else if (zombies > 0 && zombies > lastNotifiedCount) {
        lastNotifiedCount = zombies
        try {
          await sendNotification(client, sessionId, t.found(zombies, mb))
        } catch (e) {}
      } else if (zombies === 0) {
        lastNotifiedCount = 0
      }
    },

    "command.execute.before": async (input) => {
      // /zombies - check status
      if (input.command === "zombies") {
        const { count: zombies, mb } = await getZombieStats()
        const total = await getTotalCount()
        await sendNotification(client, input.sessionID, t.status(zombies, total, mb))
        throw new Error("__ZOMBIES_HANDLED__")
      }
      
      // /kill-zombies - manual kill
      if (input.command === "kill-zombies") {
        const { count: zombies, mb } = await getZombieStats()
        if (zombies > 0) {
          await killZombies()
          await sendNotification(client, input.sessionID, t.manualKilled(zombies, mb))
        } else {
          await sendNotification(client, input.sessionID, t.status(0, await getTotalCount(), 0))
        }
        throw new Error("__ZOMBIES_HANDLED__")
      }
    }
  }
}
