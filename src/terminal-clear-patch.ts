import { ProcessTerminal } from "@mariozechner/pi-tui";

import { normalizeTerminalClearSequence } from "./normalize-clear-sequence.js";

const PATCH_FLAG_KEY = "__piStartupRedrawFixPatched__" as const;

type ProcessTerminalPrototype = typeof ProcessTerminal.prototype & {
  [PATCH_FLAG_KEY]?: boolean;
};

export interface PatchResult {
  patched: boolean;
  alreadyPatched: boolean;
  error?: string;
}

export function applyTerminalClearSequencePatch(): PatchResult {
  const prototype = ProcessTerminal.prototype as ProcessTerminalPrototype;

  if (prototype[PATCH_FLAG_KEY]) {
    return { patched: false, alreadyPatched: true };
  }

  const originalWrite = prototype.write;
  if (typeof originalWrite !== "function") {
    return {
      patched: false,
      alreadyPatched: false,
      error: "ProcessTerminal.write is unavailable",
    };
  }

  prototype.write = function patchedProcessTerminalWrite(data: string): void {
    const normalized = typeof data === "string"
      ? normalizeTerminalClearSequence(data)
      : data;

    originalWrite.call(this, normalized);
  };

  prototype[PATCH_FLAG_KEY] = true;

  return { patched: true, alreadyPatched: false };
}
