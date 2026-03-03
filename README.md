# pi-startup-redraw-fix

A Pi coding agent extension that patches terminal full-clear escape sequence ordering to prevent startup redraw glitches in certain terminal emulators.

![Terminal startup fix demonstration](https://raw.githubusercontent.com/MasuRii/pi-startup-redraw-fix/main/asset/pi-startup-redraw-fix.png)

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
| Global | `~/.pi/agent/extensions/pi-startup-redraw-fix` |
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

```
~/.pi/agent/extensions/pi-startup-redraw-fix/config.json
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

## License

[MIT](LICENSE)
