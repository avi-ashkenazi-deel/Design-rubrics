-- PostgreSQL Schema for Deel Hiring Rubrics
-- This file is auto-loaded by Docker on first start

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Disciplines table
CREATE TABLE IF NOT EXISTS disciplines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Designer levels per discipline
CREATE TABLE IF NOT EXISTS designer_levels (
    id SERIAL PRIMARY KEY,
    discipline_id INTEGER REFERENCES disciplines(id) ON DELETE CASCADE,
    level_name VARCHAR(100) NOT NULL,
    file_name VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discipline_id, level_name)
);

-- Rubrics table (main data)
CREATE TABLE IF NOT EXISTS rubrics (
    id SERIAL PRIMARY KEY,
    discipline_id INTEGER REFERENCES disciplines(id) ON DELETE CASCADE,
    interview_stage VARCHAR(200) NOT NULL,
    competency VARCHAR(200) NOT NULL,
    designer_level VARCHAR(100) NOT NULL,
    score_1 TEXT,
    score_2 TEXT,
    score_3 TEXT,
    score_4 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competency definitions
CREATE TABLE IF NOT EXISTS competency_definitions (
    id SERIAL PRIMARY KEY,
    discipline_id INTEGER REFERENCES disciplines(id) ON DELETE CASCADE,
    competency VARCHAR(200) NOT NULL,
    focus_area TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discipline_id, competency)
);

-- Questions per stage and competency
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    discipline_id INTEGER REFERENCES disciplines(id) ON DELETE CASCADE,
    stage VARCHAR(200) NOT NULL,
    competency VARCHAR(200) NOT NULL,
    questions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discipline_id, stage, competency)
);

-- Change log for tracking edits (anonymous - no user tracking)
CREATE TABLE IF NOT EXISTS change_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rubrics_discipline ON rubrics(discipline_id);
CREATE INDEX IF NOT EXISTS idx_rubrics_stage ON rubrics(interview_stage);
CREATE INDEX IF NOT EXISTS idx_rubrics_competency ON rubrics(competency);
CREATE INDEX IF NOT EXISTS idx_rubrics_level ON rubrics(designer_level);
CREATE INDEX IF NOT EXISTS idx_competency_definitions_discipline ON competency_definitions(discipline_id);
CREATE INDEX IF NOT EXISTS idx_questions_discipline ON questions(discipline_id);
CREATE INDEX IF NOT EXISTS idx_questions_stage ON questions(stage);
CREATE INDEX IF NOT EXISTS idx_change_log_table ON change_log(table_name);
CREATE INDEX IF NOT EXISTS idx_change_log_time ON change_log(changed_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_rubrics_updated_at ON rubrics;
CREATE TRIGGER update_rubrics_updated_at
    BEFORE UPDATE ON rubrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_competency_definitions_updated_at ON competency_definitions;
CREATE TRIGGER update_competency_definitions_updated_at
    BEFORE UPDATE ON competency_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to log changes
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
DECLARE
    col_name TEXT;
    old_val TEXT;
    new_val TEXT;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Check each column for changes
        FOR col_name IN SELECT column_name FROM information_schema.columns 
            WHERE table_name = TG_TABLE_NAME AND column_name NOT IN ('id', 'created_at', 'updated_at', 'discipline_id')
        LOOP
            EXECUTE format('SELECT ($1).%I::TEXT', col_name) INTO old_val USING OLD;
            EXECUTE format('SELECT ($1).%I::TEXT', col_name) INTO new_val USING NEW;
            
            IF old_val IS DISTINCT FROM new_val THEN
                INSERT INTO change_log (table_name, record_id, field_name, old_value, new_value)
                VALUES (TG_TABLE_NAME, NEW.id, col_name, old_val, new_val);
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for change logging
DROP TRIGGER IF EXISTS log_rubrics_changes ON rubrics;
CREATE TRIGGER log_rubrics_changes
    AFTER UPDATE ON rubrics
    FOR EACH ROW
    EXECUTE FUNCTION log_changes();

DROP TRIGGER IF EXISTS log_competency_definitions_changes ON competency_definitions;
CREATE TRIGGER log_competency_definitions_changes
    AFTER UPDATE ON competency_definitions
    FOR EACH ROW
    EXECUTE FUNCTION log_changes();

DROP TRIGGER IF EXISTS log_questions_changes ON questions;
CREATE TRIGGER log_questions_changes
    AFTER UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION log_changes();

