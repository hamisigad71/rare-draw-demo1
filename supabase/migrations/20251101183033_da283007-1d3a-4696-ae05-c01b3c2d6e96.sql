-- Update RLS policies to allow webhook (service role) and authenticated users
-- Note: Service role key bypasses RLS, but we're adding explicit policies for clarity

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- SELECT: Everyone can view profiles
CREATE POLICY "Anyone can view profiles"
ON public.profiles
FOR SELECT
USING (true);

-- INSERT: Allow both authenticated users (via Clerk JWT) and service role (webhooks)
-- Service role bypasses this policy anyway, but this ensures authenticated users can also insert
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt()->>'sub')::text = id
);

-- UPDATE: Allow both authenticated users (via Clerk JWT) and service role (webhooks)
-- Service role bypasses this policy anyway, but this ensures authenticated users can also update
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (auth.jwt()->>'sub')::text = id
);