import log from "loglevel";
import prefix from "loglevel-plugin-prefix";
import { nanoid } from "nanoid";

const VALID_LEVELS = ["trace", "debug", "info", "warn", "error", "silent"] as const;
const LEVEL_NAMES = ["trace", "debug", "info", "warn", "error"] as const;

type ValidLevel = (typeof VALID_LEVELS)[number];
type LoggableLevel = (typeof LEVEL_NAMES)[number];

export type LogMetadata = Record<string, unknown>;

interface LogEnvelope {
  id: string;
  timestamp: string;
  level: LoggableLevel;
  message: string;
  metadata: LogMetadata;
}

const levelMapping: Record<ValidLevel, number> = {
  trace: log.levels.TRACE,
  debug: log.levels.DEBUG,
  info: log.levels.INFO,
  warn: log.levels.WARN,
  error: log.levels.ERROR,
  silent: log.levels.SILENT,
};

function normalizeLevel(value: string | undefined | null, fallback: ValidLevel): ValidLevel {
  if (!value) {
    return fallback;
  }

  const normalized = value.toLowerCase();

  if (VALID_LEVELS.includes(normalized as ValidLevel)) {
    return normalized as ValidLevel;
  }

  return fallback;
}

const resolvedLevel = normalizeLevel(
  import.meta.env.VITE_LOG_LEVEL as string | undefined,
  import.meta.env.DEV ? "debug" : "info"
);

const remoteEndpoint = (import.meta.env.VITE_LOG_REMOTE_ENDPOINT as string | undefined)?.trim() ?? "";
const remoteLevel = normalizeLevel(import.meta.env.VITE_LOG_REMOTE_LEVEL as string | undefined, "warn");
const remoteAuthToken = import.meta.env.VITE_LOG_REMOTE_TOKEN as string | undefined;
const remoteEnabled = Boolean(remoteEndpoint);

const sessionId = nanoid(12);
const runId = nanoid(10);

let contextMetadata: LogMetadata = {
  sessionId,
  runId,
  environment: import.meta.env.MODE,
  appVersion: import.meta.env.VITE_APP_VERSION ?? null,
};

prefix.reg(log);
prefix.apply(log, {
  format(level, name, timestamp) {
    return `${timestamp} [${level}]${name ? ` ${name}` : ""}`;
  },
});

log.setLevel(resolvedLevel as log.LogLevelDesc);

const isBrowser = typeof window !== "undefined";

function toPlainValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (seen.has(value)) {
    return "[Circular]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => toPlainValue(item, seen));
  }

  return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, val]) => {
    if (typeof val === "function") {
      return acc;
    }

    acc[key] = toPlainValue(val, seen);
    return acc;
  }, {});
}

function sanitizeMetadata(metadata: LogMetadata): LogMetadata {
  const seen = new WeakSet<object>();
  return toPlainValue(metadata, seen) as LogMetadata;
}

function shouldSendRemote(level: LoggableLevel): boolean {
  if (!remoteEnabled) {
    return false;
  }

  return levelMapping[level] >= levelMapping[remoteLevel];
}

async function sendRemote(payload: LogEnvelope): Promise<void> {
  if (!shouldSendRemote(payload.level)) {
    return;
  }

  const body = JSON.stringify({ events: [payload] });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (remoteAuthToken) {
    headers.Authorization = `Bearer ${remoteAuthToken}`;
  }

  try {
    if (isBrowser && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(remoteEndpoint, blob);
      return;
    }

    await fetch(remoteEndpoint, {
      method: "POST",
      headers,
      body,
      keepalive: true,
      credentials: "omit",
    });
  } catch (error) {
    log.warn("[log] Failed to send remote log", error);
  }
}

function emit(level: LoggableLevel, message: string, scoped: LogMetadata, metadata?: LogMetadata) {
  const merged = {
    ...contextMetadata,
    ...scoped,
    ...(metadata ?? {}),
  } satisfies LogMetadata;

  const envelope: LogEnvelope = {
    id: nanoid(12),
    level,
    message,
    metadata: merged,
    timestamp: new Date().toISOString(),
  };

  log[level](message, merged);

  if (remoteEnabled) {
    void sendRemote({ ...envelope, metadata: sanitizeMetadata(envelope.metadata) });
  }
}

function createScopedLogger(scoped: LogMetadata = {}) {
  return {
    trace(message: string, metadata?: LogMetadata) {
      emit("trace", message, scoped, metadata);
    },
    debug(message: string, metadata?: LogMetadata) {
      emit("debug", message, scoped, metadata);
    },
    info(message: string, metadata?: LogMetadata) {
      emit("info", message, scoped, metadata);
    },
    warn(message: string, metadata?: LogMetadata) {
      emit("warn", message, scoped, metadata);
    },
    error(message: string, metadata?: LogMetadata) {
      emit("error", message, scoped, metadata);
    },
    withContext(additional: LogMetadata) {
      return createScopedLogger({ ...scoped, ...additional });
    },
  };
}

export function updateLoggerContext(metadata: LogMetadata): void {
  contextMetadata = {
    ...contextMetadata,
    ...metadata,
  };
}

export function getLoggerContext(): LogMetadata {
  return { ...contextMetadata };
}

export function toErrorMetadata(error: unknown): LogMetadata {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
    };
  }

  return {
    message: "Unknown error",
    raw: sanitizeMetadata({ error }),
  };
}

export const logger = Object.assign(createScopedLogger(), {
  sessionId,
  runId,
});

export type AppLogger = ReturnType<typeof createScopedLogger>;

export function useLogger(scope: LogMetadata = {}) {
  return createScopedLogger(scope);
}
