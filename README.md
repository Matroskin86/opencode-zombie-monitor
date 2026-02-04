# 🧟 opencode-zombie-monitor

[![npm](https://img.shields.io/npm/v/opencode-zombie-monitor)](https://www.npmjs.com/package/opencode-zombie-monitor)
[![opencode plugin](https://img.shields.io/badge/opencode-plugin-purple)](https://opencode.ai)
[![license](https://img.shields.io/github/license/Matroskin86/opencode-zombie-monitor)](./LICENSE)

> *"The only good zombie is a dead zombie"* 💀

OpenCode plugin that hunts down and eliminates orphaned processes devouring your RAM.

## 😱 The Horror Story

You're coding happily with OpenCode. You close a terminal tab. Life goes on...

**BUT WAIT!** The process didn't die. It's still there. Lurking. Eating your RAM. And every time you close a tab without pressing `q`... another zombie rises.

```
$ ps aux | grep opencode
opencode  ??  S  156MB
opencode  ??  S  143MB
opencode  ??  S  98MB
... 💀 your RAM is gone
```

Those `??` = no TTY attached = zombie 🧟

## 📦 Install

```json
{
  "plugin": ["opencode-zombie-monitor"]
}
```

Restart OpenCode. The hunt begins 🎯

## 🔫 How it works

Every message you send → plugin scans for zombies → calculates their RAM → kills them → reports exact numbers:

```
🧟 Killed 3 zombie processes | Freed 397MB RAM | Headshot! 💥
```

No tokens wasted - notification goes via `ignored` message.

## 🎮 Commands

| Command | What |
|---------|------|
| `/zombies` | check status |
| `/kill-zombies` | manual headshot 💥 |

```
/zombies
✅ 2 processes, no zombies
```

```
/zombies
🧟 3 zombies of 5 processes | 284MB RAM | /kill-zombies
```

```
/kill-zombies
💥 Headshot! Killed 3 zombies | Freed 284MB RAM
```

## ⚙️ Config

```json
{
  "plugin": [
    ["opencode-zombie-monitor", { "autoKill": false }]
  ]
}
```

| Option | Default | What |
|--------|---------|------|
| `autoKill` | `true` | auto-kill or just notify |
| `threshold` | `1` | min zombies to trigger |

**RAMBO MODE** (default) - kill on sight:
```json
{ "autoKill": true, "threshold": 1 }
```

**MANUAL MODE** - you pull the trigger:
```json
{ "autoKill": false }
```

## 🖥️ Platforms

| Platform | Status |
|----------|--------|
| macOS | ✅ hunting |
| Linux | ✅ hunting |
| Windows | ❌ zombies win |

## 🌍 Languages

Auto-detects from `LANG`: EN, RU, ZH.

## 📜 License

MIT - use it, fork it, kill zombies with it.

---

<p align="center">
  From Russia with <img src="./assets/russia-heart.png" width="16" height="16" alt="love">
</p>
