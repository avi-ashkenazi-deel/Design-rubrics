-- Supabase Schema Migration for Design Rubrics App
-- Run this in the Supabase SQL Editor

-- ============ Enable UUID extension ============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ User Profiles Table ============
-- Links to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Rubric Data Table ============
CREATE TABLE IF NOT EXISTS public.rubric_data (
    id BIGSERIAL PRIMARY KEY,
    discipline TEXT NOT NULL,
    level TEXT NOT NULL,
    stage TEXT NOT NULL,
    competency TEXT NOT NULL,
    score_1 TEXT DEFAULT '',
    score_2 TEXT DEFAULT '',
    score_3 TEXT DEFAULT '',
    score_4 TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(discipline, level, stage, competency)
);

-- ============ Change History Table ============
CREATE TABLE IF NOT EXISTS public.change_history (
    id BIGSERIAL PRIMARY KEY,
    rubric_id BIGINT NOT NULL REFERENCES public.rubric_data(id) ON DELETE CASCADE,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by TEXT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Competency Definitions Table ============
CREATE TABLE IF NOT EXISTS public.competency_definitions (
    id BIGSERIAL PRIMARY KEY,
    discipline TEXT NOT NULL,
    competency TEXT NOT NULL,
    definition TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(discipline, competency)
);

-- ============ Questions Table ============
CREATE TABLE IF NOT EXISTS public.questions (
    id BIGSERIAL PRIMARY KEY,
    discipline TEXT NOT NULL,
    stage TEXT NOT NULL,
    competency TEXT NOT NULL,
    question TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(discipline, stage, competency)
);

-- ============ Ladder Data Table ============
CREATE TABLE IF NOT EXISTS public.ladder_data (
    id BIGSERIAL PRIMARY KEY,
    discipline TEXT NOT NULL,
    level TEXT NOT NULL,
    facet TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(discipline, level, facet)
);

-- ============ Competency Mappings Table ============
CREATE TABLE IF NOT EXISTS public.competency_mappings (
    id BIGSERIAL PRIMARY KEY,
    discipline TEXT NOT NULL,
    hiring_competency TEXT NOT NULL,
    ladder_facet TEXT NOT NULL,
    relationship_type TEXT NOT NULL DEFAULT 'direct' CHECK (relationship_type IN ('direct', 'partial', 'hiring_only', 'ladder_only')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(discipline, hiring_competency, ladder_facet)
);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_rubric_discipline ON public.rubric_data(discipline);
CREATE INDEX IF NOT EXISTS idx_rubric_level ON public.rubric_data(level);
CREATE INDEX IF NOT EXISTS idx_rubric_stage ON public.rubric_data(stage);
CREATE INDEX IF NOT EXISTS idx_history_rubric ON public.change_history(rubric_id);
CREATE INDEX IF NOT EXISTS idx_history_changed_at ON public.change_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_competency_defs_discipline ON public.competency_definitions(discipline);
CREATE INDEX IF NOT EXISTS idx_questions_discipline ON public.questions(discipline);
CREATE INDEX IF NOT EXISTS idx_ladder_discipline ON public.ladder_data(discipline);
CREATE INDEX IF NOT EXISTS idx_mappings_discipline ON public.competency_mappings(discipline);

-- ============ Row Level Security (RLS) ============

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubric_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ladder_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_mappings ENABLE ROW LEVEL SECURITY;

-- ============ Profiles Policies ============
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============ Rubric Data Policies ============
-- Everyone can read rubrics
CREATE POLICY "Anyone can view rubrics"
    ON public.rubric_data FOR SELECT
    TO authenticated
    USING (true);

-- Only editors and admins can modify
CREATE POLICY "Editors can insert rubrics"
    ON public.rubric_data FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('editor', 'admin')
        )
    );

CREATE POLICY "Editors can update rubrics"
    ON public.rubric_data FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('editor', 'admin')
        )
    );

CREATE POLICY "Admins can delete rubrics"
    ON public.rubric_data FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============ Change History Policies ============
CREATE POLICY "Anyone can view change history"
    ON public.change_history FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Editors can insert change history"
    ON public.change_history FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('editor', 'admin')
        )
    );

-- ============ Competency Definitions Policies ============
CREATE POLICY "Anyone can view competency definitions"
    ON public.competency_definitions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Editors can modify competency definitions"
    ON public.competency_definitions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('editor', 'admin')
        )
    );

-- ============ Questions Policies ============
CREATE POLICY "Anyone can view questions"
    ON public.questions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Editors can modify questions"
    ON public.questions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('editor', 'admin')
        )
    );

-- ============ Ladder Data Policies ============
CREATE POLICY "Anyone can view ladder data"
    ON public.ladder_data FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Editors can modify ladder data"
    ON public.ladder_data FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('editor', 'admin')
        )
    );

-- ============ Competency Mappings Policies ============
CREATE POLICY "Anyone can view competency mappings"
    ON public.competency_mappings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Editors can modify competency mappings"
    ON public.competency_mappings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('editor', 'admin')
        )
    );

-- ============ Trigger to auto-create profile on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'viewer')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ Function to update updated_at timestamp ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_rubric_data_updated_at
    BEFORE UPDATE ON public.rubric_data
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competency_definitions_updated_at
    BEFORE UPDATE ON public.competency_definitions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ladder_data_updated_at
    BEFORE UPDATE ON public.ladder_data
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competency_mappings_updated_at
    BEFORE UPDATE ON public.competency_mappings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
