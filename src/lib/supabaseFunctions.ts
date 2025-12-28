import { supabase } from "@/integrations/supabase/client";
import { logger, toErrorMetadata } from "@/lib/logger";

const supabaseLogger = logger.withContext({ module: "supabase-edge" });

interface CallSupabaseFunctionOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string | undefined>;
  signal?: AbortSignal;
  authToken?: string;
}

export async function callSupabaseFunction<T = unknown>(
  functionName: string,
  options: CallSupabaseFunctionOptions = {}
): Promise<T> {
  const { body, headers = {}, authToken, method: explicitMethod } = options;
  const method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" =
    explicitMethod ?? (body ? "POST" : "GET");
  const startedAt = Date.now();

  supabaseLogger.debug("Invoking Supabase function", {
    functionName,
    method,
    hasAuthToken: Boolean(authToken),
  });

  // Use Supabase client's built-in functions.invoke method
  const { data, error } = await supabase.functions.invoke<T>(functionName, {
    body,
    headers: {
      ...headers,
      ...(authToken && { Authorization: authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}` }),
    },
    method,
  });

  if (error) {
    supabaseLogger.error("Supabase function invocation failed", {
      functionName,
      method,
      durationMs: Date.now() - startedAt,
      error: toErrorMetadata(error),
    });
    throw new Error(error.message || "Error invoking Supabase function");
  }

  supabaseLogger.info("Supabase function invocation succeeded", {
    functionName,
    method,
    durationMs: Date.now() - startedAt,
    hasData: data !== null && data !== undefined,
  });

  return data as T;
}
