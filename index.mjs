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

// Detect system language (ru = Russian, else English)
const isRussian = (process.env.LANG || process.env.LC_ALL || "").toLowerCase().startsWith("ru")

// Localized messages
const i18n = {
  en: {
    killed: (n) => `🧟 Killed ${n} zombie opencode process${n > 1 ? "es" : ""} | Freed ~${n * 100}MB RAM`,
    found: (n) => `🧟 ${n} zombie opencode process${n > 1 ? "es" : ""} | ~${n * 100}MB RAM | Fix: oc-kill-zombies`,
    status: (zombies, total) => zombies > 0
      ? `🧟 ${zombies} zombie${zombies > 1 ? "s" : ""} of ${total} process${total > 1 ? "es" : ""} | ~${zombies * 100}MB RAM | Fix: oc-kill-zombies`
      : `✅ ${total} process${total > 1 ? "es" : ""}, no zombies`,
    commandDesc: "Check zombie opencode processes"
  },
  ru: {
    killed: (n) => `🧟 Убито ${n} зомби-процессов opencode | Освобождено ~${n * 100}MB RAM`,
    found: (n) => `🧟 ${n} зомби-процессов opencode | ~${n * 100}MB RAM | Fix: oc-kill-zombies`,
    status: (zombies, total) => zombies > 0
      ? `🧟 ${zombies} зомби из ${total} процессов | ~${zombies * 100}MB RAM | Fix: oc-kill-zombies`
      : `✅ ${total} процессов, зомби нет`,
    commandDesc: "Проверить зомби-процессы opencode"
  }
}

const t = isRussian ? i18n.ru : i18n.en

// Count only processes WITHOUT terminal (real zombies)
const getZombieCount = async () => {
  try {
    // macOS: TTY = "??" | Linux: TTY = "?"
    const ttyPattern = isMac ? '??' : '?'
    const { stdout } = await execAsync(`ps aux | grep "[o]pencode" | grep -v "opencode/" | awk '$7 == "${ttyPattern}" {count++} END {print count+0}'`)
    return parseInt(stdout.trim()) || 0
  } catch {
    return 0
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

// Auto-kill threshold (1 = kill immediately)
const AUTO_KILL_THRESHOLD = 1

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

export const ZombieMonitor = async ({ client }) => {
  let lastNotifiedCount = 0

  return {
    config: async (opencodeConfig) => {
      opencodeConfig.command = opencodeConfig.command || {}
      opencodeConfig.command["zombies"] = {
        template: "",
        description: t.commandDesc
      }
    },

    "experimental.chat.messages.transform": async (input, output) => {
      const sessionId = getSessionIdFromMessages(output.messages)
      if (!sessionId) return

      const zombies = await getZombieCount()
      
      // Auto-kill if zombies >= threshold
      if (zombies >= AUTO_KILL_THRESHOLD) {
        await killZombies()
        try {
          await sendNotification(client, sessionId, t.killed(zombies))
        } catch (e) {}
        lastNotifiedCount = 0
      }
      // Notify if zombies appeared (but below threshold)
      else if (zombies > 0 && zombies > lastNotifiedCount) {
        lastNotifiedCount = zombies
        try {
          await sendNotification(client, sessionId, t.found(zombies))
        } catch (e) {}
      } else if (zombies === 0) {
        lastNotifiedCount = 0
      }
    },

    "command.execute.before": async (input) => {
      if (input.command !== "zombies") return

      const zombies = await getZombieCount()
      const total = await getTotalCount()

      await sendNotification(client, input.sessionID, t.status(zombies, total))
      throw new Error("__ZOMBIES_HANDLED__")
    }
  }
}
