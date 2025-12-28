// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";
import {
  createRequestLogger,
  ServerLogger,
} from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type RecordSessionPayload = {
  deckId?: string;
  userId?: string | null;
  completedCount?: number;
  passedCount?: number;
  totalCards?: number;
  startedAt?: string;
  finishedAt?: string;
  cardPlays?: Array<{
    cardId?: string;
    action?: string;
    playedAt?: string;
  }>;
};

type SanitizedPayload = {
  deck_id: string;
  user_id: string | null;
  completed_count: number;
  passed_count: number;
  total_cards: number;
  duration_seconds: number;
  started_at: string;
  finished_at: string;
  card_plays: Array<{
    card_id: string;
    action: "completed" | "passed";
    played_at: string;
  }>;
};

const parseAndValidatePayload = async (
  req: Request,
  log: ServerLogger
): Promise<SanitizedPayload> => {
  const body = (await req.json()) as RecordSessionPayload;

  log.debug("Received session payload", {
    hasDeckId: Boolean(body.deckId),
    cardPlayCount: Array.isArray(body.cardPlays) ? body.cardPlays.length : 0,
  });

  const deckId = body.deckId?.trim();
  if (!deckId) {
    log.warn("Rejecting session payload without deckId");
    throw new Response(JSON.stringify({ error: "deckId is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const completed = Number.isFinite(body.completedCount)
    ? Number(body.completedCount)
    : 0;
  const passed = Number.isFinite(body.passedCount)
    ? Number(body.passedCount)
    : 0;
  const total = Number.isFinite(body.totalCards)
    ? Math.max(Number(body.totalCards), 0)
    : completed + passed;

  const startedAt = body.startedAt
    ? new Date(body.startedAt).toISOString()
    : new Date().toISOString();
  const finishedAtRaw = body.finishedAt
    ? new Date(body.finishedAt).toISOString()
    : new Date().toISOString();

  const finishedAt = finishedAtRaw;

  const durationMs = Math.max(
    new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
    0
  );
  const durationSeconds = Number((durationMs / 1000).toFixed(2));

  const maxEvents = 200;
  const cardPlays = Array.isArray(body.cardPlays)
    ? body.cardPlays.slice(0, maxEvents).reduce<
        Array<{
          card_id: string;
          action: "completed" | "passed";
          played_at: string;
        }>
      >((acc, event) => {
        const cardId = event?.cardId?.trim();
        const action =
          event?.action === "completed"
            ? "completed"
            : event?.action === "passed"
            ? "passed"
            : null;

        if (!cardId || !action) {
          return acc;
        }

        const playedAt = event?.playedAt
          ? new Date(event.playedAt).toISOString()
          : finishedAt;

        acc.push({
          card_id: cardId,
          action,
          played_at: playedAt,
        });
        return acc;
      }, [])
    : [];

  log.info("Validated session payload", {
    deckId,
    userId: body.userId ?? null,
    completed,
    passed,
    totalCards: total,
    cardPlays: cardPlays.length,
  });

  return {
    deck_id: deckId,
    user_id: body.userId?.trim() || null,
    completed_count: Math.max(completed, 0),
    passed_count: Math.max(passed, 0),
    total_cards: Math.max(total, 0),
    duration_seconds: durationSeconds,
    started_at: startedAt,
    finished_at: finishedAt,
    card_plays: cardPlays,
  };
};

Deno.serve(async (req: Request) => {
  const requestId = typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const log = createRequestLogger({
    function: "record-game-session",
    requestId,
  });

  log.info("Incoming request", {
    method: req.method,
    url: req.url,
  });

  if (req.method === "OPTIONS") {
    log.debug("Responding to OPTIONS preflight", { requestId });
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    log.warn("Method not allowed", { method: req.method });
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await parseAndValidatePayload(req, log);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      log.error("Supabase credentials missing", {
        hasUrl: Boolean(supabaseUrl),
        hasServiceKey: Boolean(supabaseServiceKey),
      });
      throw new Error("Supabase credentials are not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    log.info("Inserting game session", {
      deckId: payload.deck_id,
      userId: payload.user_id,
      cardPlays: payload.card_plays.length,
    });

    const { data: sessionData, error: sessionError } = await supabase
      .from("game_sessions")
      .insert({
        deck_id: payload.deck_id,
        user_id: payload.user_id,
        completed_count: payload.completed_count,
        passed_count: payload.passed_count,
        total_cards: payload.total_cards,
        duration_seconds: payload.duration_seconds,
        started_at: payload.started_at,
        finished_at: payload.finished_at,
      })
      .select("id")
      .single();

    if (sessionError || !sessionData) {
      log.error("Failed to insert game session", {
        deckId: payload.deck_id,
        error: sessionError,
      });
      throw sessionError || new Error("Unable to create game session");
    }

    const sessionId = sessionData.id;

    if (payload.card_plays.length > 0) {
      const eventsToInsert = payload.card_plays.map((event) => ({
        session_id: sessionId,
        card_id: event.card_id,
        action: event.action,
        played_at: event.played_at,
      }));

      const { error: eventError } = await supabase
        .from("game_session_events")
        .insert(eventsToInsert);

      if (eventError) {
        log.error("Failed to insert session events", {
          deckId: payload.deck_id,
          eventCount: eventsToInsert.length,
          error: eventError,
        });
        await supabase.from("game_sessions").delete().eq("id", sessionId);
        throw eventError;
      }
    }

    log.info("Recorded game session", {
      deckId: payload.deck_id,
      sessionId,
      cardPlays: payload.card_plays.length,
    });

    return new Response(JSON.stringify({ success: true, sessionId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Response) {
      log.warn("Returning validation response", { status: error.status });
      return error;
    }

    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    log.error("Unexpected error while recording session", {
      error,
    });

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
