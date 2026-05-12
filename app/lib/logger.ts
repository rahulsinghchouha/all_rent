/**
 * @file logger.ts
 * @description Centralized structured logger for the Rents application.
 *
 * Provides a consistent logging interface with:
 *  - Log levels: debug | info | warn | error
 *  - Automatic environment detection (silences debug/info in production)
 *  - Structured JSON output in production for easy log aggregation
 *  - Human-readable coloured output in development
 *  - Optional context metadata attached to every message
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMeta {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: LogMeta;
}

// ─── Colour helpers (dev only) ──────────────────────────────────────────────
const COLOURS: Record<LogLevel, string> = {
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m",  // green
  warn: "\x1b[33m",  // yellow
  error: "\x1b[31m", // red
};
const RESET = "\x1b[0m";

// ─── Level priority map ──────────────────────────────────────────────────────
const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// ─── Active minimum level ─────────────────────────────────────────────────────
// Production suppresses debug & info to reduce noise.
const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "warn" : "debug";

// ─── Core emit function ───────────────────────────────────────────────────────
function emit(level: LogLevel, message: string, meta?: LogMeta): void {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[MIN_LEVEL]) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
  };

  if (process.env.NODE_ENV === "production") {
    // Structured JSON — pipe-friendly for log aggregators (Datadog, CloudWatch, etc.)
    const output = JSON.stringify(entry);
    if (level === "error" || level === "warn") {
      process.stderr.write(output + "\n");
    } else {
      process.stdout.write(output + "\n");
    }
  } else {
    // Pretty coloured output for local development
    const colour = COLOURS[level];
    const prefix = `${colour}[${level.toUpperCase()}]${RESET}`;
    const ts = `\x1b[90m${entry.timestamp}${RESET}`;
    const metaStr =
      meta && Object.keys(meta).length > 0
        ? `\n  ${JSON.stringify(meta, null, 2)}`
        : "";

    const consoleFn =
      level === "error"
        ? console.error
        : level === "warn"
        ? console.warn
        : console.log;

    consoleFn(`${ts} ${prefix} ${message}${metaStr}`);
  }
}

// ─── Public logger API ────────────────────────────────────────────────────────
export const logger = {
  /**
   * Verbose diagnostic messages, only shown in development.
   * @example logger.debug("Parsed request body", { body })
   */
  debug(message: string, meta?: LogMeta): void {
    emit("debug", message, meta);
  },

  /**
   * General informational messages about normal operation.
   * @example logger.info("User created", { userId: newUser.id })
   */
  info(message: string, meta?: LogMeta): void {
    emit("info", message, meta);
  },

  /**
   * Something unexpected but recoverable happened.
   * @example logger.warn("Rate limit nearly reached", { ip, count })
   */
  warn(message: string, meta?: LogMeta): void {
    emit("warn", message, meta);
  },

  /**
   * An error occurred that requires attention.
   * @example logger.error("Database insert failed", { error: err.message })
   */
  error(message: string, meta?: LogMeta): void {
    emit("error", message, meta);
  },
};
