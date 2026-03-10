-- Create user_permissions table for granular access control
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('viewer', 'super_viewer', 'editor', 'admin')),
  can_edit boolean DEFAULT false,
  visible_views text[] DEFAULT ARRAY['competencies', 'ladders'],
  visible_tracks text[] DEFAULT ARRAY['IC'],
  allowed_disciplines text[] DEFAULT NULL,
  designer_level text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Update role constraint to include super_viewer (safe to re-run)
ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_role_check;
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_role_check CHECK (role IN ('viewer', 'super_viewer', 'editor', 'admin'));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_permissions_updated_at ON user_permissions;
CREATE TRIGGER set_user_permissions_updated_at
  BEFORE UPDATE ON user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_permissions_updated_at();

-- Disable RLS for simplicity (password-gated app, no Supabase Auth yet)
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to user_permissions" ON user_permissions FOR ALL USING (true) WITH CHECK (true);

-- Seed: Admin
INSERT INTO user_permissions (email, role, can_edit, visible_views, visible_tracks, allowed_disciplines)
VALUES ('avi.ashkenazi@deel.com', 'admin', true, ARRAY['competencies', 'rubrics', 'ladders', 'admin'], ARRAY['IC', 'Manager'], NULL)
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  can_edit = EXCLUDED.can_edit,
  visible_views = EXCLUDED.visible_views,
  visible_tracks = EXCLUDED.visible_tracks,
  allowed_disciplines = EXCLUDED.allowed_disciplines;

-- Seed: Editors
INSERT INTO user_permissions (email, role, can_edit, visible_views, visible_tracks, allowed_disciplines) VALUES
  ('gav.elliott@deel.com',      'editor', true, ARRAY['competencies', 'rubrics', 'ladders'], ARRAY['IC', 'Manager'], NULL),
  ('sasha.grishin@deel.com',    'editor', true, ARRAY['competencies', 'rubrics', 'ladders'], ARRAY['IC', 'Manager'], NULL),
  ('andra.cimpan@deel.com',     'editor', true, ARRAY['competencies', 'rubrics', 'ladders'], ARRAY['IC', 'Manager'], NULL),
  ('melihhan.bozok@deel.com',   'editor', true, ARRAY['competencies', 'rubrics', 'ladders'], ARRAY['IC', 'Manager'], NULL),
  ('kunal.drego@deel.com',      'editor', true, ARRAY['competencies', 'rubrics', 'ladders'], ARRAY['IC', 'Manager'], NULL)
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  can_edit = EXCLUDED.can_edit,
  visible_views = EXCLUDED.visible_views,
  visible_tracks = EXCLUDED.visible_tracks,
  allowed_disciplines = EXCLUDED.allowed_disciplines;

-- Seed: Super Viewers (can see everything including all disciplines, but cannot edit)
INSERT INTO user_permissions (email, role, can_edit, visible_views, visible_tracks, allowed_disciplines) VALUES
  ('penelope.perez@deel.com',  'super_viewer', false, ARRAY['competencies', 'rubrics', 'ladders'], ARRAY['IC', 'Manager'], NULL),
  ('quinn.steffen@deel.com',   'super_viewer', false, ARRAY['competencies', 'rubrics', 'ladders'], ARRAY['IC', 'Manager'], NULL)
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  can_edit = EXCLUDED.can_edit,
  visible_views = EXCLUDED.visible_views,
  visible_tracks = EXCLUDED.visible_tracks,
  allowed_disciplines = EXCLUDED.allowed_disciplines;
