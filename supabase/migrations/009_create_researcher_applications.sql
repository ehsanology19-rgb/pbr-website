-- Researcher Applications table
CREATE TABLE researcher_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  experience TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE researcher_applications IS 'PBR researcher join applications';

-- Enable RLS
ALTER TABLE researcher_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can submit application" ON researcher_applications 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own applications" ON researcher_applications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON researcher_applications 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update applications" ON researcher_applications 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
