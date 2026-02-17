-- Team Members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialization TEXT,
  bio TEXT,
  photo_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  orcid_id TEXT,
  google_scholar_url TEXT,
  initials TEXT,
  avatar_color TEXT DEFAULT '#0ea5e9',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE team_members IS 'PBR research team members';

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Team members are viewable by everyone" ON team_members 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage team members" ON team_members 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- View for team stats
CREATE VIEW team_stats AS
SELECT 
  COUNT(*) FILTER (WHERE is_active) AS total_members,
  COUNT(*) FILTER (WHERE is_active AND role ILIKE '%Lead%') AS lead_researchers,
  COUNT(*) FILTER (WHERE is_active AND role ILIKE '%PhD%') AS phd_students,
  COUNT(*) FILTER (WHERE is_active AND role ILIKE '%Research%') AS researchers
FROM team_members;
