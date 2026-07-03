<div align="center">

# pi-startup-redraw-fix

[![npm version](https://img.shields.io/npm/v/pi-startup-redraw-fix?style=for-the-badge)](https://www.npmjs.com/package/pi-startup-redraw-fix)
[![License](https://img.shields.io/github/license/MasuRii/pi-startup-redraw-fix?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-blue?style=for-the-badge)]()

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y01PSSVR)

A Pi coding agent extension that patches terminal full-clear escape sequence ordering to prevent startup redraw glitches in certain terminal emulators.
<img width="1360" height="752" alt="image" src="https://github.com/user-attachments/assets/05bfd443-052c-475e-bc80-3350cde5c642" />

</div>

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [License](#license)

## Features

- **Escape Sequence Normalization** — Reorders the startup full-clear sequence from `\x1b[3J\x1b[2J\x1b[H` to `\x1b[H\x1b[2J\x1b[3J` for stable screen clearing
- **Idempotent Patching** — Applies the patch once per Node process via `ProcessTerminal.prototype.write` monkey-patching with internal flag guard
- **Failure Notifications** — Displays a UI warning on `session_start` if the patch failed to apply

## Installation

### Extension Folder (Recommended)

Place the extension folder in one of Pi's auto-discovered extension locations:

| Location | Path |
|----------|------|
| Global default | `~/.pi/agent/extensions/pi-startup-redraw-fix` (respects `PI_CODING_AGENT_DIR`) |
| Project | `.pi/extensions/pi-startup-redraw-fix` |

Alternatively, add the path to your Pi settings `extensions` array.

### npm Package

```bash
pi install npm:pi-startup-redraw-fix
```

### Git Repository

```bash
pi install git:github.com/MasuRii/pi-startup-redraw-fix
```

## Usage

This extension operates automatically with **no commands required**.

When loaded, the extension immediately patches `ProcessTerminal.prototype.write` to intercept and normalize terminal clear sequences. If the patch fails, a warning notification appears at each session start (when UI is available).

## Configuration

Configuration is stored at `config.json` alongside the extension:

```text
Default global path: ~/.pi/agent/extensions/pi-startup-redraw-fix/config.json
Actual global path: $PI_CODING_AGENT_DIR/extensions/pi-startup-redraw-fix/config.json when PI_CODING_AGENT_DIR is set
```

A template is provided at `config/config.example.json`.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable or disable the extension |

### Example Configuration

```json
{
  "enabled": true
}
```

> **Note:** If your Pi build does not honor the `enabled` flag, disable the extension by removing it from your Pi settings `extensions` list or uninstalling it.

## Technical Details

### How It Works

Pi's TUI uses `@mariozechner/pi-tui`'s `ProcessTerminal` class to write escape sequences to the terminal. This extension wraps `ProcessTerminal.prototype.write` to normalize the clear sequence order:

| Original Sequence | Fixed Sequence |
|-------------------|----------------|
| `ESC[3J` (clear scrollback) | `ESC[H` (cursor home) |
| `ESC[2J` (clear screen) | `ESC[2J` (clear screen) |
| `ESC[H` (cursor home) | `ESC[3J` (clear scrollback) |

The reordering ensures the cursor moves home before clearing, which resolves redraw glitches on certain terminal emulators.

### Architecture

| File | Purpose |
|------|---------|
| `index.ts` | Root entrypoint for Pi auto-discovery |
| `src/index.ts` | Extension bootstrap and session warning handler |
| `src/terminal-clear-patch.ts` | Monkey-patch implementation with idempotency guard |
| `src/normalize-clear-sequence.ts` | String replacement utility |
| `src/constants.ts` | Escape sequence definitions |

### Limitations

- Only affects data written via `ProcessTerminal.prototype.write`
- Only rewrites the exact byte sequence `\x1b[3J\x1b[2J\x1b[H`
- Will not help if redraw issues are caused by different escape sequences
- Patch fails if `ProcessTerminal.write` is unavailable or the API changes

## Troubleshooting

### Warning: "failed to patch terminal clear sequence …"

This warning appears on `session_start` when the extension cannot patch `ProcessTerminal.prototype.write`.

**Possible Causes:**

- Incompatible Pi or `@mariozechner/pi-tui` version where `ProcessTerminal.write` is missing or changed
- Another extension modified the terminal layer unexpectedly

**Solutions:**

1. Update Pi and all extensions to latest versions
2. Temporarily disable other terminal/TUI-related extensions to identify conflicts
3. Verify the extension is loaded from an auto-discovery folder or referenced in Pi settings

## Development

```bash
# Build TypeScript
npm run build

# Run linter
npm run lint

# Run tests
npm run test

# Run all checks
npm run check
```

### Requirements

- Node.js ≥ 20
- Peer dependencies: `@mariozechner/pi-coding-agent`, `@mariozechner/pi-tui`

## Related Pi Extensions

- [pi-tool-display](https://github.com/MasuRii/pi-tool-display) — Compact tool rendering and diff visualization
- [pi-hide-messages](https://github.com/MasuRii/pi-hide-messages) — Hide older chat messages without losing context
- [pi-image-tools](https://github.com/MasuRii/pi-image-tools) — Image attachment and inline preview
- [pi-smart-voice-notify](https://github.com/MasuRii/pi-smart-voice-notify) — Multi-channel TTS and sound notifications

## License

[MIT](LICENSE)
