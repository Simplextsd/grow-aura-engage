-- Fix calls table: Remove all existing policies and recreate with separate policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can manage their own calls" ON public.calls;
  DROP POLICY IF EXISTS "Users can view their own calls" ON public.calls;
  DROP POLICY IF EXISTS "Users can insert their own calls" ON public.calls;
  DROP POLICY IF EXISTS "Users can update their own calls" ON public.calls;
  DROP POLICY IF EXISTS "Users can delete their own calls" ON public.calls;
END $$;

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

-- Strengthen profiles table policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view only their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update only their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Prevent profile ID modification" ON public.profiles;
END $$;

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
WITH CHECK (auth.uid() = id);

-- Fix courses table: Block access to unpublished courses
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;
  DROP POLICY IF EXISTS "Users can manage their own courses" ON public.courses;
END $$;

CREATE POLICY "Only published courses are viewable by non-owners"
ON public.courses
FOR SELECT
TO authenticated
USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own courses"
ON public.courses
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Fix lessons table: Simplify enrollment check to prevent bypass
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Published lessons are viewable by enrolled students" ON public.lessons;
  DROP POLICY IF EXISTS "Users can manage their own lessons" ON public.lessons;
END $$;

CREATE POLICY "Only course owners can manage lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM courses
  WHERE courses.id = lessons.course_id 
  AND courses.user_id = auth.uid()
));

CREATE POLICY "Enrolled students can view published lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (
  is_published = true 
  AND EXISTS (
    SELECT 1 FROM course_enrollments ce
    JOIN contacts c ON c.id = ce.contact_id
    WHERE ce.course_id = lessons.course_id 
    AND c.user_id = auth.uid()
  )
);