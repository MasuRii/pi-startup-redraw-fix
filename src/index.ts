import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { loadStartupRedrawFixConfig } from "./config.js";
import { createStartupRedrawFixLogger } from "./logging.js";
import { applyTerminalClearSequencePatch } from "./terminal-clear-patch.js";

export default function startupRedrawFixExtension(pi: ExtensionAPI): void {
  const config = loadStartupRedrawFixConfig();
  if (!config.enabled) {
    return;
  }

  const logger = createStartupRedrawFixLogger({ getConfig: () => config });

  // The terminal clear-sequence patch must be installed before the first
  // full-clear write at startup, so it is applied synchronously at registration
  // rather than deferred. The local import graph is tiny (a few dozen lines) and
  // the only package dependency, pi-tui, is already loaded by Pi core, so there
  // is no meaningful startup transpile cost to defer here.
  const patchResult = applyTerminalClearSequencePatch();
  logger.debug("patch.applied", {
    patched: patchResult.patched,
    alreadyPatched: patchResult.alreadyPatched,
    error: patchResult.error,
  });

  pi.on("session_start", async (_event, ctx) => {
    if (!ctx.hasUI) {
      return;
    }

    if (!patchResult.patched && !patchResult.alreadyPatched) {
      const reason = patchResult.error ?? "unknown error";
      ctx.ui.notify(`startup-redraw-fix: failed to patch terminal clear sequence (${reason})`, "warning");
    }
  });
}
