-- Insert competency definitions
INSERT INTO public.competency_definitions (discipline, competency, definition) VALUES
('Account Executive Expansion', 'Sales Acumen', ''),
('Account Executive Expansion', 'High Performance', ''),
('Account Executive Expansion', 'Executional Excellence', ''),
('Account Executive Expansion', 'Problem Solving', ''),
('Account Executive Expansion', 'Customer Experience', ''),
('Account Executive Expansion', 'Communication', ''),
('Account Executive Expansion', 'Collaboration', ''),
('Account Executive Expansion', 'Coachability', ''),
('Design', 'Craft & Visual Design:', 'This is the executional quality of the work. It encompasses a designer''s strong command of typography, layout, color, and spacing, ensuring UIs are clean, consistent, and well-structured. It also includes the demonstration of taste, a refined visual sensibility that results in designs that "just look good" and feel balanced and intentional. Prototyping and AI-driven design are also crucial here; designers should be able to create high-fidelity prototypes to share with the team and explore emerging tools like AI to enhance their workflow.'),
('Design', 'User-Centered Problem Solving:', 'This is the foundation of great UX. It''s the ability to define and simplify complex user problems and create intuitive, elegant, and user-centered solutions. This includes framing problems clearly, mapping pain points, thinking through all possible states and edge cases, and catching them early in the process.'),
('Design', 'Product Sense & Strategy:', 'This competency is about understanding the broader business context and how design directly contributes to product goals and business outcomes. It’s about being a strategic partner, challenging low-impact features, and contributing to the roadmap. Designs should be intentional and grounded in data, leveraging both qualitative and quantitative insights to validate decisions and frame them as testable hypotheses.'),
('Design', 'Collaboration', 'Designers at Deel are expected to work seamlessly across functions, building strong partnerships with peers and stakeholders. They proactively seek and provide feedback, foster trust, and contribute to a supportive, solution-oriented team environment. Effective collaboration means understanding cross-functional priorities, aligning on shared goals, and ensuring design decisions complement broader business and product objectives.'),
('Design', 'Communication', 'Clear, confident communication is essential for Deel designers. They must be skilled storytellers who can articulate design decisions with clarity and purpose, tailoring their message to suit different audiences. Beyond simply presenting work, they "sell" their design vision - bringing others along the journey through persuasive narratives that connect design rationale to user needs and business impact.'),
('Design', 'Ownership & Drive:', 'This is about a designer''s agency and self-motivation. A high-performing designer takes initiative, pushes for quality, and drives work forward without being asked. They act with autonomy and demonstrate a deep sense of responsibility for their work, bringing potential solutions to the table rather than just problems.'),
('Partnerships', 'Partner (or Enterprise) Prospecting', ''),
('Partnerships', 'Negotiation skills', ''),
('Partnerships', 'Relationship Management', ''),
('Partnerships', 'Channel Knowledge', ''),
('Partnerships', 'Key Account Management', ''),
('Partnerships', 'Metrics Management', ''),
('Partnerships', 'Communication', ''),
('Partnerships', 'Collaboration', ''),
('Partnerships', 'Resilience', ''),
('Partnerships', 'Stakeholder Management', ''),
('Partnerships', 'Coachability', ''),
('Partnerships', 'Sales Methodologies', ''),
('SDR', 'Executional Excellence', ''),
('SDR', 'Customer Experience', ''),
('SDR', 'Technical Aptitude', ''),
('SDR', 'Problem Solving', ''),
('SDR', 'Communication', ''),
('SDR', 'Coachability', ''),
('SDR', 'Motivation', ''),
('SDR', 'Desire to Learn', '')
ON CONFLICT (discipline, competency) DO UPDATE SET
  definition = EXCLUDED.definition;

-- Verify counts
SELECT 'rubric_data' as table_name, COUNT(*) as count FROM public.rubric_data
UNION ALL SELECT 'questions', COUNT(*) FROM public.questions
UNION ALL SELECT 'competency_definitions', COUNT(*) FROM public.competency_definitions;
