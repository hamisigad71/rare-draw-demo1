-- Update RLS policies for profiles table to allow webhook operations with anon key

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Drop existing update policy  
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new insert policy that allows:
-- 1. Authenticated users to insert their own profile
-- 2. Unauthenticated requests (webhooks) to insert any profile
CREATE POLICY "Users and webhooks can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() IS NULL OR (auth.uid())::text = id
);

-- Create new update policy that allows:
-- 1. Authenticated users to update their own profile
-- 2. Unauthenticated requests (webhooks) to update any profile
CREATE POLICY "Users and webhooks can update profiles"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() IS NULL OR (auth.uid())::text = id
);