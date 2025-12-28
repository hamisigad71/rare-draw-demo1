type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

type DenoLike = {
  env?: {
    get(key: string): string | undefined;
  };
};

const globalDeno = (globalThis as { Deno?: DenoLike }).Deno;

const envGet = (key: string): string | undefined => {
  try {
    return globalDeno?.env?.get ? globalDeno.env.get(key) : undefined;
  } catch (_error) {
    return undefined;
  }
};

const LOG_LEVEL_ENV = (envGet("EDGE_LOG_LEVEL") || envGet("LOG_LEVEL") || "info").toLowerCase();

function normalizeLevel(level: string): LogLevel {
  switch (level) {
    case "debug":
    case "info":
    case "warn":
    case "error":
      return level;
    default:
      return "info";
  }
}

const activeLevel = normalizeLevel(LOG_LEVEL_ENV);

let baseContext: Record<string, unknown> = {
  environment: envGet("ENVIRONMENT") ?? envGet("NODE_ENV") ?? "production",
  region: envGet("VERCEL_REGION") ?? null,
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[activeLevel];
}

function sanitize(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (value === null || typeof value !== "object") {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  }

  if (seen.has(value)) {
    return "[Circular]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, seen));
  }

  const output: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    if (typeof val === "function") {
      continue;
    }
    output[key] = sanitize(val, seen);
  }

  return output;
}

function emit(level: LogLevel, message: string, context: Record<string, unknown>) {
  if (!shouldLog(level)) {
    return;
  }

  const mergedContext = {
    ...baseContext,
    ...context,
  };

  const sanitizedContext = sanitize(mergedContext) as Record<string, unknown>;

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizedContext,
  };

  const consoleMethod =
    level === "error"
      ? console.error
      : level === "warn"
      ? console.warn
      : level === "info"
      ? console.info
      : console.debug;

  consoleMethod(payload);
}

function createScopedLogger(context: Record<string, unknown> = {}) {
  return {
    debug(message: string, metadata: Record<string, unknown> = {}) {
      emit("debug", message, { ...context, ...metadata });
    },
    info(message: string, metadata: Record<string, unknown> = {}) {
      emit("info", message, { ...context, ...metadata });
    },
    warn(message: string, metadata: Record<string, unknown> = {}) {
      emit("warn", message, { ...context, ...metadata });
    },
    error(message: string, metadata: Record<string, unknown> = {}) {
      emit("error", message, { ...context, ...metadata });
    },
    withContext(additional: Record<string, unknown>) {
      return createScopedLogger({ ...context, ...additional });
    },
  };
}

export const logger = createScopedLogger();

export function updateLoggerContext(metadata: Record<string, unknown>): void {
  baseContext = {
    ...baseContext,
    ...metadata,
  };
}

export function createRequestLogger(metadata: Record<string, unknown>) {
  return logger.withContext(metadata);
}

export type ServerLogger = ReturnType<typeof logger.withContext>;
