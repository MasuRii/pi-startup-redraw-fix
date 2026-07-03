import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface StartupRedrawFixConfig {
  enabled: boolean;
  debug: boolean;
}

const DEFAULT_CONFIG: StartupRedrawFixConfig = {
  enabled: true,
  debug: false,
};

function resolveExtensionRoot(moduleUrl = import.meta.url): string {
  return join(dirname(fileURLToPath(moduleUrl)), "..");
}

export const EXTENSION_ROOT = resolveExtensionRoot();
export const CONFIG_PATH = join(EXTENSION_ROOT, "config.json");
export const DEBUG_DIR = join(EXTENSION_ROOT, "debug");
export const DEBUG_LOG_PATH = join(DEBUG_DIR, "debug.log");

type ReadConfigResult =
  | { ok: true; record: Record<string, unknown> }
  | { ok: false; reason: "missing" | "unparseable" | "not-object" };

/**
 * Reads and validates the config file as a plain object.
 *
 * Returns a structured result so callers can react to each failure mode
 * (missing, unparseable, non-object) without silently swallowing errors.
 */
function readConfigRecord(configPath: string): ReadConfigResult {
  if (!existsSync(configPath)) {
    return { ok: false, reason: "missing" };
  }

  try {
    const raw = readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, reason: "not-object" };
    }
    return { ok: true, record: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, reason: "unparseable" };
  }
}

function readBoolean(record: Record<string, unknown>, key: keyof StartupRedrawFixConfig): boolean {
  const value = record[key];
  return typeof value === "boolean" ? value : DEFAULT_CONFIG[key];
}

export function loadStartupRedrawFixConfig(): StartupRedrawFixConfig {
  const result = readConfigRecord(CONFIG_PATH);
  if (!result.ok) {
    return { ...DEFAULT_CONFIG };
  }

  return {
    enabled: readBoolean(result.record, "enabled"),
    debug: readBoolean(result.record, "debug"),
  };
}
