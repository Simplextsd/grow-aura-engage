-- Fix calls table: Split ALL policy into separate policies with explicit checks
DROP POLICY IF EXISTS "Users can manage their own calls" ON public.calls;

CREATE POLICY "Users can view their own calls"
ON public.calls
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calls"
ON public.calls
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calls"
ON public.calls
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calls"
ON public.calls
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Strengthen profiles table policies to prevent any data leakage
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate with explicit authentication and stricter checks
CREATE POLICY "Users can view only their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update only their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND id = auth.uid());

-- Prevent users from changing their own ID
CREATE POLICY "Prevent profile ID modification"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (id = (SELECT id FROM public.profiles WHERE id = auth.uid()));