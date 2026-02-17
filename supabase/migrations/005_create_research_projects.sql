-- Research Projects table
CREATE TABLE research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Upcoming', 'Completed', 'On Hold')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  end_date DATE,
  funding_source TEXT,
  funding_amount NUMERIC,
  tags JSONB DEFAULT '[]',
  research_area_id UUID REFERENCES research_areas(id) ON DELETE SET NULL,
  lead_researcher_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  team_members JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE research_projects IS 'PBR research projects';

-- Enable RLS
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Projects are viewable by everyone" ON research_projects 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage projects" ON research_projects 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- View for project stats
CREATE VIEW project_stats AS
SELECT 
  COUNT(*) FILTER (WHERE is_active) AS total_projects,
  COUNT(*) FILTER (WHERE is_active AND status = 'Active') AS active_projects,
  COUNT(*) FILTER (WHERE is_active AND status = 'Completed') AS completed_projects,
  COUNT(*) FILTER (WHERE is_active AND status = 'Upcoming') AS upcoming_projects
FROM research_projects;
