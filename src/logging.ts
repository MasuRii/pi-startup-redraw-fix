/**
 * Debug logging for pi-startup-redraw-fix.
 *
 * Appends debug output to a file inside the colocated `debug/` directory
 * when `debug` is true. Creates the directory at runtime only when debug
 * logging is enabled. No console or stdio output.
 */
import { mkdirSync } from "node:fs";
import { appendFile } from "node:fs/promises";

import { DEBUG_DIR, DEBUG_LOG_PATH } from "./config.js";

export interface StartupRedrawFixLogger {
  /** Log a debug event with optional details. No-op when debug is false. */
  debug: (event: string, details?: Record<string, unknown>) => void;
  /** Wait for all queued debug writes to complete. */
  flush: () => Promise<void>;
}

interface LoggerOptions {
  /** Function returning the current config (checked on each call for live debug state). */
  getConfig: () => { debug: boolean };
  /** Override path for the debug log file. */
  debugLogPath?: string;
  /** Override path for the debug directory. */
  debugDir?: string;
}

/**
 * Creates a debug logger that writes to a colocated debug/ directory.
 *
 * - Debug output is only written when `config.debug` is true.
 * - The debug/ directory is created at runtime only when debug logging is enabled.
 * - All writes are async and queued to avoid blocking the extension.
 * - No output is written to console, stdout, or stderr.
 */
export function createStartupRedrawFixLogger(options: LoggerOptions): StartupRedrawFixLogger {
  const logPath = options.debugLogPath ?? DEBUG_LOG_PATH;
  const logDir = options.debugDir ?? DEBUG_DIR;
  let writeQueue: Promise<void> = Promise.resolve();

  const enqueueAppend = (line: string): void => {
    writeQueue = writeQueue.then(
      () => appendFile(logPath, `${line}\n`, "utf8"),
      () => appendFile(logPath, `${line}\n`, "utf8"),
    );
    void writeQueue.catch(() => {
      // Logging must never write to stdout/stderr or interrupt extension operation.
    });
  };

  const debug = (event: string, details: Record<string, unknown> = {}): void => {
    if (!options.getConfig().debug) {
      return;
    }

    try {
      mkdirSync(logDir, { recursive: true });
    } catch {
      // Cannot create debug directory — skip logging without disrupting startup.
      return;
    }

    const line = JSON.stringify({
      timestamp: new Date().toISOString(),
      extension: "pi-startup-redraw-fix",
      event,
      ...details,
    });
    enqueueAppend(line);
  };

  const flush = (): Promise<void> => writeQueue.catch(() => undefined);

  return { debug, flush };
}
