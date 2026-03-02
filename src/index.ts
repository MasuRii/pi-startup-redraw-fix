import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import { applyTerminalClearSequencePatch } from "./terminal-clear-patch.js";

export default function startupRedrawFixExtension(pi: ExtensionAPI): void {
  const patchResult = applyTerminalClearSequencePatch();

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
