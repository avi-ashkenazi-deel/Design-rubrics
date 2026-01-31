-- Run this to allow access without Supabase Auth
-- Since we're using frontend password protection instead

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view rubrics" ON public.rubric_data;
DROP POLICY IF EXISTS "Editors can insert rubrics" ON public.rubric_data;
DROP POLICY IF EXISTS "Editors can update rubrics" ON public.rubric_data;
DROP POLICY IF EXISTS "Admins can delete rubrics" ON public.rubric_data;
DROP POLICY IF EXISTS "Anyone can view change history" ON public.change_history;
DROP POLICY IF EXISTS "Editors can insert change history" ON public.change_history;
DROP POLICY IF EXISTS "Anyone can view competency definitions" ON public.competency_definitions;
DROP POLICY IF EXISTS "Editors can modify competency definitions" ON public.competency_definitions;
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
DROP POLICY IF EXISTS "Editors can modify questions" ON public.questions;
DROP POLICY IF EXISTS "Anyone can view ladder data" ON public.ladder_data;
DROP POLICY IF EXISTS "Editors can modify ladder data" ON public.ladder_data;
DROP POLICY IF EXISTS "Anyone can view competency mappings" ON public.competency_mappings;
DROP POLICY IF EXISTS "Editors can modify competency mappings" ON public.competency_mappings;

-- Create open policies (allow all operations with anon key)
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to rubric_data" ON public.rubric_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to change_history" ON public.change_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to competency_definitions" ON public.competency_definitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to ladder_data" ON public.ladder_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to competency_mappings" ON public.competency_mappings FOR ALL USING (true) WITH CHECK (true);
