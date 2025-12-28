-- Migration: 20251117093000_add_game_session_events.sql
-- Purpose: Track per-card outcomes within a game session

BEGIN;

CREATE TABLE IF NOT EXISTS public.game_session_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('completed', 'passed')),
  played_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_game_session_events_session_id
  ON public.game_session_events (session_id);
CREATE INDEX IF NOT EXISTS idx_game_session_events_card_id
  ON public.game_session_events (card_id);

ALTER TABLE public.game_session_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their session events" ON public.game_session_events;
CREATE POLICY "Users can view their session events"
  ON public.game_session_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.game_sessions
      WHERE game_sessions.id = game_session_events.session_id
        AND (auth.uid())::text = game_sessions.user_id
    )
  );

DROP POLICY IF EXISTS "Users can insert their session events" ON public.game_session_events;
CREATE POLICY "Users can insert their session events"
  ON public.game_session_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.game_sessions
      WHERE game_sessions.id = game_session_events.session_id
        AND (auth.uid())::text = game_sessions.user_id
    )
  );

COMMIT;
