-- Migration: 20251101000002_limit_premium_card_access.sql
-- Purpose: Allow everyone to view deck metadata while enforcing premium card access rules

BEGIN;

DROP POLICY IF EXISTS "Cards are viewable by everyone" ON public.cards;

CREATE POLICY "Cards view requires free deck or purchase"
ON public.cards FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.decks d
    WHERE d.id = cards.deck_id
      AND (
        d.is_free = true
        OR d.creator_id = (auth.uid())::text
        OR (
          (auth.uid())::text IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.purchases p
            WHERE p.deck_id = cards.deck_id
              AND p.user_id = (auth.uid())::text
          )
        )
      )
  )
);

COMMIT;
