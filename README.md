# OpenCode Zombie Monitor

[![GitHub](https://img.shields.io/github/license/Matroskin86/opencode-zombie-monitor)](https://github.com/Matroskin86/opencode-zombie-monitor/blob/main/LICENSE)

Automatically detects and kills orphaned (zombie) OpenCode processes that consume RAM after closing terminal tabs.

## The Problem

When you close an iTerm2/terminal tab without properly exiting OpenCode (`q` or `Ctrl+C`), the process keeps running in the background without a terminal (TTY). These "zombie" processes accumulate and consume ~100MB RAM each.

## Solution

This plugin automatically:
- 🔍 Detects zombie processes (no TTY) on every message
- 🧟 Kills them immediately
- 📢 Shows notification in chat (doesn't use LLM tokens)

## Installation

Add to your `opencode.json`:

```json
{
  "plugin": ["github:Matroskin86/opencode-zombie-monitor"]
}
```

Restart OpenCode.

## Usage

**Automatic:** Plugin checks for zombies on every message and kills them automatically.

**Manual:** Use `/zombies` command to check current status.

## Notifications

When zombies are killed:
```
🧟 Killed 3 zombie opencode processes | Freed ~300MB RAM
```

When checking status (`/zombies`):
```
✅ 2 processes, no zombies
```

## Configuration

Edit `index.mjs` to change auto-kill threshold:

```javascript
// Kill immediately (default)
const AUTO_KILL_THRESHOLD = 1

// Or kill only when 5+ zombies accumulate
const AUTO_KILL_THRESHOLD = 5
```

## Supported Platforms

| Platform | Status |
|----------|--------|
| macOS    | ✅     |
| Linux    | ✅     |
| Windows  | ❌     |

## Language Support

Auto-detects system language from `LANG` / `LC_ALL` environment variables:
- 🇬🇧 English (default)
- 🇷🇺 Russian

## How It Works

1. Uses `ps aux` to list processes
2. Filters by TTY column (`??` on macOS, `?` on Linux = no terminal)
3. Kills orphaned processes with `kill -9`
4. Sends notification via OpenCode's `ignored` message (no LLM cost)

## License

MIT
