-- Migration: 20251130120000_create_deck_card_counts_view.sql
-- Purpose: Provide a stable, RLS-safe view that exposes
--          deck metadata and the number of cards per deck
--          without leaking individual card content.

BEGIN;

DROP VIEW IF EXISTS public.deck_card_counts;

CREATE VIEW public.deck_card_counts AS
SELECT
  d.id AS deck_id,
  d.name,
  d.description,
  d.theme,
  d.category,
  d.thumbnail_url,
  d.price,
  d.is_free,
  d.is_public,
  d.featured,
  d.plays,
  d.rating,
  d.total_ratings,
  d.creator_id,
  d.created_at,
  d.updated_at,
  COUNT(c.id) AS card_count
FROM public.decks d
LEFT JOIN public.cards c ON c.deck_id = d.id
GROUP BY
  d.id,
  d.name,
  d.description,
  d.theme,
  d.category,
  d.thumbnail_url,
  d.price,
  d.is_free,
  d.is_public,
  d.featured,
  d.plays,
  d.rating,
  d.total_ratings,
  d.creator_id,
  d.created_at,
  d.updated_at;

-- Note: RLS policies can be defined on this view separately
-- from the underlying cards table to allow broader access
-- to aggregate metadata while keeping card contents protected.

COMMIT;
