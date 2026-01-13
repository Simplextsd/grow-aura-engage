-- Fix courses table: Block access to unpublished courses
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Users can manage their own courses" ON public.courses;

-- Only show published courses to everyone
CREATE POLICY "Only published courses are publicly viewable"
ON public.courses
FOR SELECT
TO authenticated, anon
USING (is_published = true);

-- Course owners can manage all their courses (published or not)
CREATE POLICY "Users can manage their own courses"
ON public.courses
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Fix lessons table: Simplify enrollment check to prevent bypass
DROP POLICY IF EXISTS "Published lessons are viewable by enrolled students" ON public.lessons;
DROP POLICY IF EXISTS "Users can manage their own lessons" ON public.lessons;

-- Only course owners can manage lessons
CREATE POLICY "Users can manage their own course lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.courses
  WHERE courses.id = lessons.course_id
  AND courses.user_id = auth.uid()
));

-- Simplified enrollment check: directly verify enrollment with auth user
CREATE POLICY "Enrolled users can view published lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM public.course_enrollments
    JOIN public.contacts ON contacts.id = course_enrollments.contact_id
    WHERE course_enrollments.course_id = lessons.course_id
    AND contacts.user_id = auth.uid()
  )
);