-- Update RLS policies for Clerk + Supabase integration
-- Following official Clerk guide: use auth.jwt()->>'sub' for Clerk user IDs

-- Drop existing webhook-permissive policies
DROP POLICY IF EXISTS "Users and webhooks can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users and webhooks can update profiles" ON public.profiles;

-- Create secure policies that only allow authenticated Clerk users to manage their own profiles
-- The webhook will use service role key which bypasses RLS
CREATE POLICY "Authenticated users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt()->>'sub')::text = id
);

CREATE POLICY "Authenticated users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (auth.jwt()->>'sub')::text = id
);