-- Migration: Grant anon role access to public schema and tables
-- Purpose: Allow unauthenticated users to view marketplace

BEGIN;

-- Grant usage on public schema to anon role
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select on tables that should be publicly viewable
GRANT SELECT ON public.decks TO anon;
GRANT SELECT ON public.cards TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.deck_ratings TO anon;

-- Grant access to sequences (needed for viewing data)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

COMMIT;