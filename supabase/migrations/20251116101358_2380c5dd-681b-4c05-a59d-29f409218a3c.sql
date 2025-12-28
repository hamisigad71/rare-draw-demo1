-- Fix search_path for existing functions by setting them to empty string
-- This forces all references to be fully qualified for security

-- Fix update_deck_rating function
create or replace function public.update_deck_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.decks
  set 
    rating = (select avg(rating) from public.deck_ratings where deck_id = new.deck_id),
    total_ratings = (select count(*) from public.deck_ratings where deck_id = new.deck_id)
  where id = new.deck_id;
  return new;
end;
$$;

-- Fix update_updated_at_column function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;