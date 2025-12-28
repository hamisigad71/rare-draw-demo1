BEGIN;

GRANT SELECT ON public.deck_card_counts TO anon;
GRANT SELECT ON public.deck_card_counts TO authenticated;

COMMIT;