import assert from "node:assert/strict";
import test from "node:test";

import { ProcessTerminal } from "@earendil-works/pi-tui";
import { BROKEN_FULL_CLEAR_SEQUENCE, FIXED_FULL_CLEAR_SEQUENCE } from "./src/constants.ts";
import { normalizeTerminalClearSequence } from "./src/normalize-clear-sequence.ts";
import { applyTerminalClearSequencePatch } from "./src/terminal-clear-patch.ts";

const PATCH_FLAG_KEY = "__piStartupRedrawFixPatched__";

function withFreshPatchedTerminal(callback) {
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
    callback(writes, prototype);
  } finally {
    prototype.write = originalWrite;
    if (originalPatched === undefined) {
      delete prototype[PATCH_FLAG_KEY];
    } else {
      prototype[PATCH_FLAG_KEY] = originalPatched;
    }
  }
}

test("normalizeTerminalClearSequence replaces every broken clear sequence", () => {
  const input = ["before", BROKEN_FULL_CLEAR_SEQUENCE, "middle", BROKEN_FULL_CLEAR_SEQUENCE, "after"].join("");
  const normalized = normalizeTerminalClearSequence(input);

  assert.equal(normalized.includes(BROKEN_FULL_CLEAR_SEQUENCE), false);
  assert.equal(normalized, ["before", FIXED_FULL_CLEAR_SEQUENCE, "middle", FIXED_FULL_CLEAR_SEQUENCE, "after"].join(""));
  assert.equal(normalizeTerminalClearSequence("unchanged"), "unchanged");
});

test("applyTerminalClearSequencePatch wraps ProcessTerminal.write once and normalizes writes", () => {
  withFreshPatchedTerminal((writes, prototype) => {
    prototype.write(`x${BROKEN_FULL_CLEAR_SEQUENCE}y`);
    assert.deepEqual(writes, [`x${FIXED_FULL_CLEAR_SEQUENCE}y`]);
    assert.deepEqual(applyTerminalClearSequencePatch(), { patched: false, alreadyPatched: true });
  });
});

test("applyTerminalClearSequencePatch normalizes a full-clear sequence split across adjacent writes", () => {
  for (let splitIndex = 1; splitIndex < BROKEN_FULL_CLEAR_SEQUENCE.length; splitIndex += 1) {
    withFreshPatchedTerminal((writes, prototype) => {
      prototype.write(`before${BROKEN_FULL_CLEAR_SEQUENCE.slice(0, splitIndex)}`);
      prototype.write(`${BROKEN_FULL_CLEAR_SEQUENCE.slice(splitIndex)}after`);

      assert.equal(
        writes.join(""),
        `before${FIXED_FULL_CLEAR_SEQUENCE}after`,
        `split index ${splitIndex} should not leak the broken clear ordering`,
      );
      assert.equal(writes.join("").includes(BROKEN_FULL_CLEAR_SEQUENCE), false);
    });
  }
});
