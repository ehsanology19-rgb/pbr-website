-- ============================================
-- PBR Website Database Setup
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================
CREATE TYPE app_role AS ENUM ('student', 'admin', 'instructor');
CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'resolved', 'closed');

-- ============================================
-- 2. PROFILES & USER ROLES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  university TEXT,
  field_of_study TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 3. TEAM MEMBERS
-- ============================================
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

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members are viewable by everyone" ON team_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage team members" ON team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 4. RESEARCH AREAS
-- ============================================
CREATE TABLE research_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  highlights JSONB DEFAULT '[]',
  icon TEXT,
  gradient_from TEXT DEFAULT '#0ea5e9',
  gradient_to TEXT DEFAULT '#6366f1',
  image_url TEXT,
  methodologies JSONB DEFAULT '[]',
  equipment JSONB DEFAULT '[]',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE research_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Research areas are viewable by everyone" ON research_areas FOR SELECT USING (true);
CREATE POLICY "Admins can manage research areas" ON research_areas FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Insert default research areas
INSERT INTO research_areas (title, slug, description, icon, gradient_from, gradient_to, display_order, highlights) VALUES
('In Silico Research', 'in-silico', 'Computational approaches including molecular modeling, bioinformatics, and machine learning for drug discovery and biological analysis.', 'Computer', '#3b82f6', '#8b5cf6', 1, '["Molecular Docking", "MD Simulations", "QSAR Modeling", "AI/ML Drug Discovery"]'),
('In Vitro Research', 'in-vitro', 'Laboratory-based experiments using cell cultures, biochemical assays, and tissue models to study biological processes.', 'Flask', '#10b981', '#14b8a6', 2, '["Cell Culture", "Biochemical Assays", "Protein Analysis", "Drug Screening"]'),
('In Vivo Research', 'in-vivo', 'Studies conducted in living organisms to validate findings and understand complex biological interactions.', 'Heart', '#f59e0b', '#ef4444', 3, '["Animal Models", "Pharmacokinetics", "Toxicology", "Efficacy Studies"]');

-- ============================================
-- 5. PUBLICATIONS
-- ============================================
CREATE TABLE publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  journal TEXT NOT NULL,
  year INTEGER NOT NULL,
  publication_type TEXT DEFAULT 'Research Article',
  doi TEXT,
  authors JSONB DEFAULT '[]',
  abstract TEXT,
  pdf_url TEXT,
  external_link TEXT,
  citation_count INTEGER DEFAULT 0,
  impact_factor NUMERIC,
  keywords JSONB DEFAULT '[]',
  research_area_id UUID REFERENCES research_areas(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publications are viewable by everyone" ON publications FOR SELECT USING (true);
CREATE POLICY "Admins can manage publications" ON publications FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 6. RESEARCH PROJECTS
-- ============================================
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

ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are viewable by everyone" ON research_projects FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects" ON research_projects FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 7. COLLABORATIONS
-- ============================================
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

ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collaborations are viewable by everyone" ON collaborations FOR SELECT USING (true);
CREATE POLICY "Admins can manage collaborations" ON collaborations FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 8. SITE SETTINGS
-- ============================================
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are viewable by everyone" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

INSERT INTO site_settings (key, value, description, category) VALUES
('site_name', '"Pharmacology & Biomedical Research"', 'Website name', 'general'),
('site_tagline', '"Advancing Science Through Innovation"', 'Website tagline', 'general'),
('contact_email', '"contact@pbr-research.org"', 'Primary contact email', 'contact'),
('contact_phone', '"+880-XXX-XXXXXXX"', 'Primary contact phone', 'contact'),
('address', '"Department of Pharmacy, University of XYZ"', 'Physical address', 'contact'),
('social_links', '{"facebook": "", "twitter": "", "linkedin": "", "researchgate": ""}', 'Social media links', 'social'),
('hero_stats', '[{"label": "Publications", "value": "50+"}, {"label": "Researchers", "value": "15+"}, {"label": "Projects", "value": "20+"}]', 'Hero section statistics', 'homepage'),
('publication_stats', '{"total": 50, "citations": 500, "hIndex": 12}', 'Publication achievements', 'homepage');

-- ============================================
-- 9. CONTACT SUBMISSIONS
-- ============================================
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status contact_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact form" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact submissions" ON contact_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update contact submissions" ON contact_submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 10. RESEARCHER APPLICATIONS
-- ============================================
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

ALTER TABLE researcher_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit application" ON researcher_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own applications" ON researcher_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all applications" ON researcher_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update applications" ON researcher_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 11. VIEWS FOR STATISTICS
-- ============================================
CREATE VIEW team_stats AS
SELECT 
  COUNT(*) FILTER (WHERE is_active) AS total_members,
  COUNT(*) FILTER (WHERE is_active AND role ILIKE '%Lead%') AS lead_researchers,
  COUNT(*) FILTER (WHERE is_active AND role ILIKE '%PhD%') AS phd_students,
  COUNT(*) FILTER (WHERE is_active AND role ILIKE '%Research%') AS researchers
FROM team_members;

CREATE VIEW publication_stats AS
SELECT 
  COUNT(*) FILTER (WHERE is_active) AS total_publications,
  COALESCE(SUM(citation_count) FILTER (WHERE is_active), 0) AS total_citations,
  COUNT(DISTINCT journal) FILTER (WHERE is_active) AS unique_journals,
  COUNT(*) FILTER (WHERE is_active AND is_featured) AS featured_count
FROM publications;

CREATE VIEW project_stats AS
SELECT 
  COUNT(*) FILTER (WHERE is_active) AS total_projects,
  COUNT(*) FILTER (WHERE is_active AND status = 'Active') AS active_projects,
  COUNT(*) FILTER (WHERE is_active AND status = 'Completed') AS completed_projects,
  COUNT(*) FILTER (WHERE is_active AND status = 'Upcoming') AS upcoming_projects
FROM research_projects;

-- ============================================
-- 12. AVATARS STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- DONE! Database setup complete.
-- ============================================
