# Changelog

## [Unreleased]

## [0.2.0] - 2026-07-03

### Added
- Added an `enabled` master toggle (defaults to `true`) that gates extension startup, and structured debug logging written to an extension-local `debug/` directory when `debug` is enabled. ([2d57235](https://github.com/MasuRii/pi-startup-redraw-fix/commit/2d57235b6b72b6ec28f0a5298228d8fafe828da5))

### Changed
- Widened Pi coding-agent and Pi TUI peer dependency ranges through `^0.80.0` and added a `postinstall` patch with npm `overrides` to resolve known vulnerabilities in transitive dependencies. ([2f1f400](https://github.com/MasuRii/pi-startup-redraw-fix/commit/2f1f400f804ee08b8f72f0f5d43ee6194de9b500))
- Extracted a fresh-terminal fixture helper for the terminal clear-sequence tests. ([0fc323d](https://github.com/MasuRii/pi-startup-redraw-fix/commit/0fc323d19a74ed9e7cdf070cb57015261e22865f))
- Updated README badge styling and added a ko-fi support button. ([0c3f0c3](https://github.com/MasuRii/pi-startup-redraw-fix/commit/0c3f0c36291a637dc47f2a5e8335eeb152e26244))

## [0.1.13] - 2026-06-16

### Fixed
- Buffered trailing broken clear-sequence prefixes across multiple `write` calls so split escape sequences that arrive in separate chunks are correctly normalized instead of being silently discarded.

## [0.1.12] - 2026-06-01

### Changed
- Consolidated clear-sequence constants and normalization into the terminal clear patch while preserving synchronous startup patching.
- Widened peer dependency ranges to `^0.74.0 || ^0.75.0 || ^0.77.0 || ^0.78.0`.

## [0.1.11] - 2026-05-26

### Changed
- Widened peer dependency ranges to `^0.74.0 || ^0.75.0`

## [0.1.10] - 2026-05-22

### Changed
- Aligned Pi peer dependency metadata with the `@earendil-works` Pi v0.75.4 extension runtime packages.

## [0.1.9] - 2026-04-25

### Changed
- Clarified the global extension path and `PI_CODING_AGENT_DIR` override behavior in README installation and configuration guidance
- Updated `@mariozechner/pi-coding-agent` and `@mariozechner/pi-tui` peer dependencies to ^0.70.2

## [0.1.7] - 2026-04-01

### Changed
- Updated npm keywords and package metadata for improved discoverability

## [0.1.6] - 2026-04-01

### Changed
- Updated `@mariozechner/pi-coding-agent` and `@mariozechner/pi-tui` peer dependencies to ^0.64.0

## [0.1.5] - 2026-03-23

### Changed
- Updated `@mariozechner/pi-coding-agent` and `@mariozechner/pi-tui` peer dependencies to ^0.62.0

## [0.1.4] - 2026-03-12

### Changed
- Updated AWS SDK and related dependencies

## [0.1.3] - 2026-03-04

### Fixed
- Use absolute GitHub raw URL for README image to fix npm display

## [0.1.2] - 2026-03-04

### Changed
- Rewrote README.md with professional documentation standards
- Added comprehensive feature documentation, configuration reference, and usage examples

## 0.1.1

- Added `asset/` to the npm `files` whitelist so README image assets are included in package tarballs.
- Bumped patch version for republish.

## 0.1.0

- Standardized repository structure with `src/` layout and root shim entrypoint.
- Kept terminal clear-sequence patch behavior unchanged.
