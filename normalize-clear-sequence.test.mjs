import assert from "node:assert/strict";
import test from "node:test";

import { ProcessTerminal } from "@earendil-works/pi-tui";
import { BROKEN_FULL_CLEAR_SEQUENCE, FIXED_FULL_CLEAR_SEQUENCE } from "./src/constants.ts";
import { normalizeTerminalClearSequence } from "./src/normalize-clear-sequence.ts";
import { applyTerminalClearSequencePatch } from "./src/terminal-clear-patch.ts";

const PATCH_FLAG_KEY = "__piStartupRedrawFixPatched__";

test("normalizeTerminalClearSequence replaces every broken clear sequence", () => {
  const input = ["before", BROKEN_FULL_CLEAR_SEQUENCE, "middle", BROKEN_FULL_CLEAR_SEQUENCE, "after"].join("");
  const normalized = normalizeTerminalClearSequence(input);

  assert.equal(normalized.includes(BROKEN_FULL_CLEAR_SEQUENCE), false);
  assert.equal(normalized, ["before", FIXED_FULL_CLEAR_SEQUENCE, "middle", FIXED_FULL_CLEAR_SEQUENCE, "after"].join(""));
  assert.equal(normalizeTerminalClearSequence("unchanged"), "unchanged");
});

test("applyTerminalClearSequencePatch wraps ProcessTerminal.write once and normalizes writes", () => {
  const prototype = ProcessTerminal.prototype;
  const originalWrite = prototype.write;
  const originalPatched = prototype[PATCH_FLAG_KEY];
  const writes = [];

  try {
    prototype.write = function writeFixture(data) {
      writes.push(data);
    };
    delete prototype[PATCH_FLAG_KEY];

    assert.deepEqual(applyTerminalClearSequencePatch(), { patched: true, alreadyPatched: false });
    prototype.write(`x${BROKEN_FULL_CLEAR_SEQUENCE}y`);
    assert.deepEqual(writes, [`x${FIXED_FULL_CLEAR_SEQUENCE}y`]);
    assert.deepEqual(applyTerminalClearSequencePatch(), { patched: false, alreadyPatched: true });
  } finally {
    prototype.write = originalWrite;
    if (originalPatched === undefined) {
      delete prototype[PATCH_FLAG_KEY];
    } else {
      prototype[PATCH_FLAG_KEY] = originalPatched;
    }
  }
});
