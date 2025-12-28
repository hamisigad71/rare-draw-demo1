-- Migration: 20251117091500_add_game_sessions_table.sql
-- Purpose: Track single-player game session analytics

BEGIN;

CREATE TABLE IF NOT EXISTS public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  user_id text REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_cards integer NOT NULL DEFAULT 0,
  completed_count integer NOT NULL DEFAULT 0,
  passed_count integer NOT NULL DEFAULT 0,
  duration_seconds numeric(10,2) NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  finished_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_deck_id ON public.game_sessions (deck_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON public.game_sessions (created_at);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their sessions" ON public.game_sessions;
CREATE POLICY "Users can view their sessions"
  ON public.game_sessions FOR SELECT
  USING ((auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can insert their sessions" ON public.game_sessions;
CREATE POLICY "Users can insert their sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id);

COMMIT;
