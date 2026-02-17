-- ============================================================
-- Migration: Competency Framework Restructure
-- Date: 2026-01-31
-- Purpose: Rename Design competencies to align with new 
--          three-tier framework and add Deel discipline
-- ============================================================

-- ============ STEP 1: Rename competencies in rubric_data ============

UPDATE public.rubric_data SET competency = 'Craft Excellence' 
WHERE discipline = 'Design' AND competency IN ('Craft & Visual Design:', 'Craft & Visual Design');

UPDATE public.rubric_data SET competency = 'Business Acumen' 
WHERE discipline = 'Design' AND competency IN ('Product Sense & Strategy:', 'Product Sense & Strategy');

UPDATE public.rubric_data SET competency = 'Customer Focus' 
WHERE discipline = 'Design' AND competency IN ('User-Centered Problem Solving:', 'User-Centered Problem Solving', 'User-centered problem solving');

UPDATE public.rubric_data SET competency = 'Ownership' 
WHERE discipline = 'Design' AND competency IN ('Ownership & Drive:', 'Ownership & Drive');

-- ============ STEP 2: Rename competencies in competency_definitions ============

UPDATE public.competency_definitions SET competency = 'Craft Excellence',
  definition = 'This is the executional quality of the work. It encompasses a designer''s strong command of typography, layout, color, and spacing, ensuring UIs are clean, consistent, and well-structured. It also includes the demonstration of taste, a refined visual sensibility that results in designs that "just look good" and feel balanced and intentional. Prototyping and AI-driven design are also crucial here; designers should be able to create high-fidelity prototypes to share with the team and explore emerging tools like AI to enhance their workflow.'
WHERE discipline = 'Design' AND competency IN ('Craft & Visual Design:', 'Craft & Visual Design');

UPDATE public.competency_definitions SET competency = 'Business Acumen',
  definition = 'This competency is about understanding the broader business context and how design directly contributes to product goals and business outcomes. It''s about being a strategic partner, challenging low-impact features, and contributing to the roadmap. Designs should be intentional and grounded in data, leveraging both qualitative and quantitative insights to validate decisions and frame them as testable hypotheses.'
WHERE discipline = 'Design' AND competency IN ('Product Sense & Strategy:', 'Product Sense & Strategy');

UPDATE public.competency_definitions SET competency = 'Customer Focus',
  definition = 'This is the foundation of great UX. It''s the ability to define and simplify complex user problems and create intuitive, elegant, and user-centered solutions. This includes framing problems clearly, mapping pain points, thinking through all possible states and edge cases, and catching them early in the process.'
WHERE discipline = 'Design' AND competency IN ('User-Centered Problem Solving:', 'User-Centered Problem Solving', 'User-centered problem solving');

UPDATE public.competency_definitions SET competency = 'Ownership',
  definition = 'This is about a designer''s agency and self-motivation. A high-performing designer takes initiative, pushes for quality, and drives work forward without being asked. They act with autonomy and demonstrate a deep sense of responsibility for their work, bringing potential solutions to the table rather than just problems.'
WHERE discipline = 'Design' AND competency IN ('Ownership & Drive:', 'Ownership & Drive');

-- ============ STEP 3: Rename competencies in questions ============

UPDATE public.questions SET competency = 'Craft Excellence' 
WHERE discipline = 'Design' AND competency IN ('Craft & Visual Design:', 'Craft & Visual Design');

UPDATE public.questions SET competency = 'Business Acumen' 
WHERE discipline = 'Design' AND competency IN ('Product Sense & Strategy:', 'Product Sense & Strategy');

UPDATE public.questions SET competency = 'Customer Focus' 
WHERE discipline = 'Design' AND competency IN ('User-Centered Problem Solving:', 'User-Centered Problem Solving', 'User-centered problem solving');

UPDATE public.questions SET competency = 'Ownership' 
WHERE discipline = 'Design' AND competency IN ('Ownership & Drive:', 'Ownership & Drive');

-- ============ STEP 4: Rename ladder facets ============

UPDATE public.ladder_data SET facet = 'Problem Solving' 
WHERE discipline = 'Design' AND facet = 'Strategy';

UPDATE public.ladder_data SET facet = 'Craft Excellence' 
WHERE discipline = 'Design' AND facet = 'Craft';

UPDATE public.ladder_data SET facet = 'Ownership' 
WHERE discipline = 'Design' AND facet IN ('Ownership & Autonomy', 'Ownership & Autonomy:');

UPDATE public.ladder_data SET facet = 'Adaptability' 
WHERE discipline = 'Design' AND facet = 'Culture';

-- ============ STEP 5: Add Deel discipline competency definitions ============

INSERT INTO public.competency_definitions (discipline, competency, definition) VALUES
('Deel', 'Problem Solving', 'Solves complex problems fast. Uses data, judgment, and creativity to get to the root cause and deliver practical, high-impact solutions. Stays focused under pressure and turns challenges into opportunities to drive better results.'),
('Deel', 'Adaptability', 'Responds quickly and effectively to change, shifting priorities, and uncertainty. Maintains performance under pressure and adjusts approach as needed. Embraces feedback, learns fast, and continuously evolves to stay ahead.'),
('Deel', 'Customer Focus', 'Puts the customer at the center of decisions and actions. Builds strong relationships, anticipates needs, and delivers solutions that create real value. Balances customer satisfaction with business outcomes.'),
('Deel', 'Ownership', 'Takes full responsibility for results and follows through relentlessly. Acts with initiative, delivers on commitments, and holds themselves and others accountable. Stays focused and moves work forward, even when direction is limited or conditions change.'),
('Deel', 'Drives High Performance', 'Creates the conditions for sustained excellence. Sets high standards, reinforces focus and accountability, and builds the systems and behaviors that help teams consistently exceed expectations.'),
('Deel', 'Develops Talent', 'Actively builds the capabilities of others to strengthen team performance and future readiness. Provides candid feedback, stretch opportunities, and coaching to accelerate growth. Invests in developing high-potential talent and holds people accountable for learning and progress.'),
('Deel', 'Execution & Impact', 'Delivers high-quality results with urgency and discipline. Hits OKRs, clears roadblocks fast, and drives measurable business outcomes, regardless of ambiguity or challenge. Owns outcomes end-to-end and holds the bar high for self and others.')
ON CONFLICT (discipline, competency) DO UPDATE SET
  definition = EXCLUDED.definition;

-- ============ STEP 6: Verify ============

SELECT discipline, competency FROM public.competency_definitions 
WHERE discipline IN ('Design', 'Deel') 
ORDER BY discipline, competency;

SELECT 'rubric_data renamed' as check_name, COUNT(*) as count 
FROM public.rubric_data 
WHERE discipline = 'Design' AND competency IN ('Craft Excellence', 'Business Acumen', 'Customer Focus', 'Ownership');

SELECT 'Deel definitions added' as check_name, COUNT(*) as count 
FROM public.competency_definitions 
WHERE discipline = 'Deel';
