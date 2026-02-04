# 🧟 OpenCode Zombie Monitor

[![npm](https://img.shields.io/npm/v/opencode-zombie-monitor)](https://www.npmjs.com/package/opencode-zombie-monitor)
[![GitHub](https://img.shields.io/github/license/Matroskin86/opencode-zombie-monitor)](https://github.com/Matroskin86/opencode-zombie-monitor/blob/main/LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-blue)]()
[![OpenCode](https://img.shields.io/badge/opencode-plugin-purple)]()

> *"The only good zombie is a dead zombie"* 💀

Automatically hunts down and eliminates orphaned OpenCode processes that lurk in your system, devouring precious RAM.

## 😱 The Horror Story

You're coding happily with OpenCode. You close a terminal tab. Life goes on...

**BUT WAIT!** The process didn't die. It's still there. Lurking. Consuming ~100MB of your RAM. And every time you close a tab without pressing `q`... another zombie rises.

Before you know it:
```
$ ps aux | grep opencode
opencode  ??  100MB
opencode  ??  100MB
opencode  ??  100MB
opencode  ??  100MB
... 💀 YOUR RAM IS GONE 💀
```

## 🔫 The Solution

This plugin is your zombie apocalypse survival kit:

- 🔍 **Detects** zombie processes (no TTY = undead)
- 🧟 **Kills** them on sight (every message you send)
- 📢 **Reports** the kills (without wasting LLM tokens)
- 🧹 **Keeps** your system clean automatically

## 📦 Installation

Add to your `opencode.json`:

```json
{
  "plugin": ["opencode-zombie-monitor"]
}
```

Restart OpenCode. The hunt begins. 🎯

## 🎮 Usage

### Automatic Mode (default)

Just chat normally. The plugin silently patrols your system and eliminates zombies on every message.

When zombies are neutralized, you'll see:
```
🧟 Killed 3 zombie processes | Freed 300MB RAM | Headshot! 💥
```

### Commands

| Command | Description |
|---------|-------------|
| `/zombies` | Check zombie status |
| `/kill-zombies` | Manually kill all zombies |

**Check status:**
```
/zombies
```
```
✅ 2 processes, no zombies
```
or
```
🧟 5 zombies of 7 processes | 500MB RAM | /kill-zombies
```

**Manual kill:**
```
/kill-zombies
```
```
💥 Headshot! Killed 5 zombies | Freed 500MB RAM
```

## ⚙️ Configuration

Configure in your `opencode.json`:

```json
{
  "plugin": [
    ["opencode-zombie-monitor", {
      "autoKill": true,
      "threshold": 1
    }]
  ]
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `autoKill` | `true` | Auto-kill zombies on every message |
| `threshold` | `1` | Minimum zombies to trigger action |

### Modes

**RAMBO MODE** (default) — Kill on sight:
```json
{ "autoKill": true, "threshold": 1 }
```

**PATIENT MODE** — Wait until horde forms:
```json
{ "autoKill": true, "threshold": 5 }
```

**MANUAL MODE** — Only notify, kill with `/kill-zombies`:
```json
{ "autoKill": false }
```

## 🖥️ Supported Platforms

| Platform | Status | TTY Pattern |
|----------|--------|-------------|
| macOS    | ✅ Ready to hunt | `??` |
| Linux    | ✅ Ready to hunt | `?` |
| Windows  | ❌ Zombies win | N/A |

## 🌍 Language Support

Auto-detects your language. Because zombies are international.

| Language | Detection | Example |
|----------|-----------|---------|
| 🇬🇧 English | default | "Killed 3 zombie processes" |
| 🇷🇺 Russian | `LANG=ru*` | "Убито 3 зомби-процессов" |
| 🇨🇳 Chinese | `LANG=zh*` | "已击杀 3 个僵尸进程" |

## 🔬 How It Works

```
┌─────────────────────────────────────────┐
│  You send a message                     │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│  Plugin runs: ps aux | grep opencode    │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│  Filter: TTY == "??" (no terminal)      │
│  These are the zombies 🧟               │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│  Execute: kill -9 <zombie_pids>         │
│  Headshot! 💥                           │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│  Notify via "ignored" message           │
│  (Free! No LLM tokens used)             │
└─────────────────────────────────────────┘
```

## 🤝 Contributing

Found a bug? Zombies escaped? Open an issue!

Want to add Windows support? PRs welcome! (Good luck with that 😅)

## 📜 License

MIT — Use it, fork it, kill zombies with it.

---

<p align="center">
  <i>Made with 🧠 (before zombies ate it)</i>
  <br><br>
  <b>From Russia with <img src="./assets/russia-heart.png" width="20" height="20" alt="love"></b>
</p>
