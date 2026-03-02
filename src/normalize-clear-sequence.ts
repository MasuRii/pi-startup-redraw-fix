import { BROKEN_FULL_CLEAR_SEQUENCE, FIXED_FULL_CLEAR_SEQUENCE } from "./constants.js";

export function normalizeTerminalClearSequence(data: string): string {
  if (!data.includes(BROKEN_FULL_CLEAR_SEQUENCE)) {
    return data;
  }

  return data.split(BROKEN_FULL_CLEAR_SEQUENCE).join(FIXED_FULL_CLEAR_SEQUENCE);
}
