-- Step 1: Clear existing data
TRUNCATE public.rubric_data CASCADE;
TRUNCATE public.questions CASCADE;
TRUNCATE public.competency_definitions CASCADE;
TRUNCATE public.change_history CASCADE;

-- Verify tables are empty
SELECT 'Tables cleared' as status;
