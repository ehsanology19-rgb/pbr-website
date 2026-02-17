-- Collaborations table
CREATE TABLE collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution_type TEXT DEFAULT 'Academic' CHECK (institution_type IN ('Academic', 'Research Lab', 'Industry', 'Government', 'Hospital', 'NGO', 'Other')),
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  contact_person TEXT,
  contact_email TEXT,
  country TEXT,
  start_date DATE,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Pending')),
  collaboration_areas JSONB DEFAULT '[]',
  projects_together JSONB DEFAULT '[]',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE collaborations IS 'PBR institutional collaborations and partners';

-- Enable RLS
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Collaborations are viewable by everyone" ON collaborations 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage collaborations" ON collaborations 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
