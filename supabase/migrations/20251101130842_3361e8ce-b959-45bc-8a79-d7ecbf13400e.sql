-- Migration: Grant anon role access to purchases table
-- Purpose: Allow card access policy to check purchases for anonymous users

BEGIN;

-- Grant select on purchases table to anon role
-- RLS policies will still prevent them from seeing any data
GRANT SELECT ON public.purchases TO anon;

COMMIT;