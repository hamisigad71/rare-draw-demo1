-- Migration: 20250101000001_initial_schema.sql
-- Purpose: Sets up the RareDraw base schema, RLS policies, helper functions, and seed data

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_deck_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.decks
  SET
    rating = COALESCE((SELECT AVG(rating)::numeric FROM public.deck_ratings WHERE deck_id = NEW.deck_id), 0),
    total_ratings = (SELECT COUNT(*) FROM public.deck_ratings WHERE deck_id = NEW.deck_id)
  WHERE id = NEW.deck_id;

  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,
  username text NOT NULL,
  email text,
  avatar_url text,
  badges text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  theme text NOT NULL,
  description text,
  category text,
  thumbnail_url text,
  price numeric NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  plays integer NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 0,
  total_ratings integer NOT NULL DEFAULT 0,
  creator_id text REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  action_type text NOT NULL,
  order_index integer,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  host_id text NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'waiting',
  current_card_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  turn_order integer NOT NULL,
  score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.deck_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT deck_ratings_user_unique UNIQUE (deck_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE RESTRICT,
  amount numeric NOT NULL CHECK (amount >= 0),
  payment_method text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON public.cards (deck_id);
CREATE INDEX IF NOT EXISTS idx_games_deck_id ON public.games (deck_id);
CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON public.game_players (game_id);
CREATE INDEX IF NOT EXISTS idx_deck_ratings_deck_id ON public.deck_ratings (deck_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases (user_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deck_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((auth.uid())::text = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ((auth.uid())::text = id);

DROP POLICY IF EXISTS "Decks are viewable by everyone" ON public.decks;
CREATE POLICY "Decks are viewable by everyone"
  ON public.decks FOR SELECT
  USING (is_public = true OR creator_id = (auth.uid())::text);

DROP POLICY IF EXISTS "Users can create decks" ON public.decks;
CREATE POLICY "Users can create decks"
  ON public.decks FOR INSERT
  WITH CHECK ((auth.uid())::text = creator_id);

DROP POLICY IF EXISTS "Users can update their own decks" ON public.decks;
CREATE POLICY "Users can update their own decks"
  ON public.decks FOR UPDATE
  USING ((auth.uid())::text = creator_id);

DROP POLICY IF EXISTS "Users can delete their own decks" ON public.decks;
CREATE POLICY "Users can delete their own decks"
  ON public.decks FOR DELETE
  USING ((auth.uid())::text = creator_id);

DROP POLICY IF EXISTS "Cards are viewable by everyone" ON public.cards;
CREATE POLICY "Cards are viewable by everyone"
  ON public.cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.decks
      WHERE decks.id = cards.deck_id
        AND (decks.is_public = true OR decks.creator_id = (auth.uid())::text)
    )
  );

DROP POLICY IF EXISTS "Users can create cards for their decks" ON public.cards;
CREATE POLICY "Users can create cards for their decks"
  ON public.cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.decks
      WHERE decks.id = cards.deck_id
        AND decks.creator_id = (auth.uid())::text
    )
  );

DROP POLICY IF EXISTS "Users can update cards in their decks" ON public.cards;
CREATE POLICY "Users can update cards in their decks"
  ON public.cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.decks
      WHERE decks.id = cards.deck_id
        AND decks.creator_id = (auth.uid())::text
    )
  );

DROP POLICY IF EXISTS "Users can delete cards from their decks" ON public.cards;
CREATE POLICY "Users can delete cards from their decks"
  ON public.cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.decks
      WHERE decks.id = cards.deck_id
        AND decks.creator_id = (auth.uid())::text
    )
  );

DROP POLICY IF EXISTS "Users can view their own games" ON public.games;
CREATE POLICY "Users can view their own games"
  ON public.games FOR SELECT
  USING ((auth.uid())::text = host_id);

DROP POLICY IF EXISTS "Users can create games" ON public.games;
CREATE POLICY "Users can create games"
  ON public.games FOR INSERT
  WITH CHECK ((auth.uid())::text = host_id);

DROP POLICY IF EXISTS "Hosts can update their games" ON public.games;
CREATE POLICY "Hosts can update their games"
  ON public.games FOR UPDATE
  USING ((auth.uid())::text = host_id);

DROP POLICY IF EXISTS "Hosts can delete their games" ON public.games;
CREATE POLICY "Hosts can delete their games"
  ON public.games FOR DELETE
  USING ((auth.uid())::text = host_id);

DROP POLICY IF EXISTS "Users can view their own player records" ON public.game_players;
CREATE POLICY "Users can view their own player records"
  ON public.game_players FOR SELECT
  USING ((auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can add themselves to games" ON public.game_players;
CREATE POLICY "Users can add themselves to games"
  ON public.game_players FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Players can update their own status" ON public.game_players;
CREATE POLICY "Players can update their own status"
  ON public.game_players FOR UPDATE
  USING ((auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Everyone can view deck ratings" ON public.deck_ratings;
CREATE POLICY "Everyone can view deck ratings"
  ON public.deck_ratings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create ratings" ON public.deck_ratings;
CREATE POLICY "Users can create ratings"
  ON public.deck_ratings FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can update their own ratings" ON public.deck_ratings;
CREATE POLICY "Users can update their own ratings"
  ON public.deck_ratings FOR UPDATE
  USING ((auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
CREATE POLICY "Users can view their own purchases"
  ON public.purchases FOR SELECT
  USING ((auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can create purchases" ON public.purchases;
CREATE POLICY "Users can create purchases"
  ON public.purchases FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_decks_updated_at ON public.decks;
CREATE TRIGGER update_decks_updated_at
  BEFORE UPDATE ON public.decks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_games_updated_at ON public.games;
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_deck_rating_trigger ON public.deck_ratings;
CREATE TRIGGER update_deck_rating_trigger
  AFTER INSERT OR UPDATE ON public.deck_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_deck_rating();

INSERT INTO public.decks (name, theme, description, category, is_free, featured, thumbnail_url)
VALUES
  ('Ultimate Icebreakers', 'Light & Fun', 'Perfect conversation starters for any social gathering. Break the ice and get everyone talking with these engaging questions.', 'Social', true, true, '/src/assets/deck-icebreaker.jpg'),
  ('Deep Conversations', 'Thoughtful & Meaningful', 'Dive into meaningful discussions that strengthen relationships and create deeper connections.', 'Intimate', false, true, '/src/assets/deck-deep.jpg'),
  ('Family Fun Night', 'All Ages', 'Questions designed for family bonding. Create lasting memories with questions everyone can enjoy.', 'Family', true, false, '/src/assets/deck-family.jpg'),
  ('Date Night Deluxe', 'Romance & Connection', 'Strengthen your relationship with thoughtful questions designed for couples.', 'Couples', false, true, '/src/assets/deck-romance.jpg'),
  ('Party Starters', 'High Energy', 'Get the party going with exciting questions and fun challenges that energize any gathering.', 'Party', false, false, '/src/assets/deck-party.jpg'),
  ('Career & Ambitions', 'Professional Growth', 'Explore career goals, professional dreams, and workplace experiences.', 'Professional', false, false, '/src/assets/deck-career.jpg'),
  ('Travel Tales', 'Adventure & Exploration', 'Share wanderlust stories and dream destinations with fellow travelers.', 'Lifestyle', false, false, '/src/assets/deck-adventure.jpg'),
  ('Foodie Favorites', 'Culinary Conversations', 'Discuss favorite dishes, cooking adventures, and food memories.', 'Lifestyle', true, false, '/src/assets/deck-foodie.jpg'),
  ('Creative Minds', 'Art & Imagination', 'Explore creativity, artistic passions, and imaginative thinking.', 'Creative', false, false, '/src/assets/deck-creative.jpg'),
  ('Nostalgic Moments', 'Memory Lane', 'Journey through cherished memories and childhood experiences.', 'Social', false, true, '/src/assets/deck-childhood.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What''s your hidden talent?', 'Share a skill or ability most people don''t know you have.', 'question', 1
FROM public.decks WHERE name = 'Ultimate Icebreakers'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'If you could have dinner with anyone, who would it be?', 'Past or present, fictional or real - who would you choose?', 'question', 2
FROM public.decks WHERE name = 'Ultimate Icebreakers'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'Do your best celebrity impression!', 'Pick any celebrity and show us your best impression.', 'dare', 3
FROM public.decks WHERE name = 'Ultimate Icebreakers'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What does success mean to you?', 'Beyond money and status, what truly defines success in your life?', 'question', 1
FROM public.decks WHERE name = 'Deep Conversations'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What''s a belief you held strongly but changed your mind about?', 'Share a time your perspective shifted significantly.', 'question', 2
FROM public.decks WHERE name = 'Deep Conversations'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What''s your favorite family tradition?', 'Share a tradition that makes your family special.', 'question', 1
FROM public.decks WHERE name = 'Family Fun Night'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'Act out a funny family memory!', 'Recreate a hilarious moment from your family history.', 'dare', 2
FROM public.decks WHERE name = 'Family Fun Night'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What was your first impression of me?', 'Share what you thought when we first met.', 'question', 1
FROM public.decks WHERE name = 'Date Night Deluxe'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What''s your favorite memory of us?', 'Describe a moment that stands out in our relationship.', 'question', 2
FROM public.decks WHERE name = 'Date Night Deluxe'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'Show us your best dance move!', 'Get up and show everyone your signature move.', 'dare', 1
FROM public.decks WHERE name = 'Party Starters'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What''s the most embarrassing thing that happened to you at a party?', 'Time to share that cringe-worthy party moment!', 'question', 2
FROM public.decks WHERE name = 'Party Starters'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What''s your dream job?', 'If you could do anything professionally, what would it be?', 'question', 1
FROM public.decks WHERE name = 'Career & Ambitions'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What professional achievement are you most proud of?', 'Share a career milestone that means the most to you.', 'question', 2
FROM public.decks WHERE name = 'Career & Ambitions'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What''s the most beautiful place you''ve ever visited?', 'Describe a destination that took your breath away.', 'question', 1
FROM public.decks WHERE name = 'Travel Tales'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'Share your most adventurous travel story!', 'Tell us about a wild or unexpected adventure.', 'question', 2
FROM public.decks WHERE name = 'Travel Tales'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What''s your all-time favorite meal?', 'Describe the dish that brings you pure joy.', 'question', 1
FROM public.decks WHERE name = 'Foodie Favorites'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What''s the weirdest food you''ve ever tried?', 'Share an unusual culinary experience!', 'question', 2
FROM public.decks WHERE name = 'Foodie Favorites'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What''s your favorite form of creative expression?', 'Art, music, writing, or something else?', 'question', 1
FROM public.decks WHERE name = 'Creative Minds'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'Create a 30-second story about the room you''re in!', 'Use your imagination to tell a creative tale.', 'challenge', 2
FROM public.decks WHERE name = 'Creative Minds'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What''s your favorite childhood memory?', 'Take us back to a special moment from your youth.', 'question', 1
FROM public.decks WHERE name = 'Nostalgic Moments'
ON CONFLICT DO NOTHING;

INSERT INTO public.cards (deck_id, title, description, action_type, order_index)
SELECT id, 'What was your favorite toy as a kid?', 'Describe the toy you couldn''t live without.', 'question', 2
FROM public.decks WHERE name = 'Nostalgic Moments'
ON CONFLICT DO NOTHING;

COMMIT;
