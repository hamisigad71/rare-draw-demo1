BEGIN;

-- Make title nullable so it can be phased out from usage
ALTER TABLE public.cards
  ALTER COLUMN title DROP NOT NULL;

-- Add suggester_nickname for tracking who suggested each prompt
ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS suggester_nickname text;

COMMIT;
