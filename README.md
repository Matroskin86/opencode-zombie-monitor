# 🧟 opencode-zombie-monitor

[![npm](https://img.shields.io/npm/v/opencode-zombie-monitor)](https://www.npmjs.com/package/opencode-zombie-monitor)
[![opencode plugin](https://img.shields.io/badge/opencode-plugin-purple)](https://opencode.ai)
[![license](https://img.shields.io/github/license/Matroskin86/opencode-zombie-monitor)](./LICENSE)

OpenCode plugin that kills orphaned processes eating your RAM.

## 😱 Problem

Close terminal without `q` → opencode process stays alive → eats ~100MB RAM. Do it 10 times → 1GB gone. Classic zombie apocalypse.

```
$ ps aux | grep opencode
opencode  ??  100MB
opencode  ??  100MB
opencode  ??  100MB
... 💀 your RAM is gone
```

Those `??` = no TTY = zombie 🧟

## 📦 Install

```json
{
  "plugin": ["opencode-zombie-monitor"]
}
```

## 🔫 How it works

Every message you send → plugin hunts zombies → kills them → reports:

```
🧟 Killed 2 zombie processes | Freed 200MB RAM | Headshot! 💥
```

No tokens wasted - notification goes via `ignored` message.

## 🎮 Commands

| Command | What |
|---------|------|
| `/zombies` | check status |
| `/kill-zombies` | manual headshot |

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
| `autoKill` | `true` | kill automatically or just notify |
| `threshold` | `1` | min zombies to trigger |

Set `autoKill: false` for manual mode - plugin will only notify, you pull the trigger with `/kill-zombies`.

## 🖥️ Platforms

- macOS ✅
- Linux ✅  
- Windows ❌ zombies win

## 🌍 Languages

Auto-detects from `LANG`: EN, RU, ZH.

## 📜 License

MIT

---

<p align="center">
  From Russia with <img src="./assets/russia-heart.png" width="16" height="16" alt="love">
</p>
