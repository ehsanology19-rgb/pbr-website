-- ============================================
-- PBR Website - Complete Database Schema
-- ============================================
-- This is a consolidated schema file containing all tables, enums, 
-- views, functions, triggers, and storage buckets for the PBR website.
-- Run this entire script in Supabase SQL Editor for a fresh installation.
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================

CREATE TYPE app_role AS ENUM ('student', 'admin', 'instructor');
CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'resolved', 'closed');

-- ============================================
-- 2. CORE TABLES
-- ============================================

-- Profiles table (linked to auth.users)
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

COMMENT ON TABLE profiles IS 'User profiles linked to Supabase auth.users';

-- User roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

COMMENT ON TABLE user_roles IS 'User role assignments (admin, instructor, student)';

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

-- Research Areas table
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

COMMENT ON TABLE research_areas IS 'PBR research domains (In Silico, In Vitro, In Vivo)';

-- Publications table
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

COMMENT ON TABLE publications IS 'PBR research publications and papers';

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

-- Contact Submissions table
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

COMMENT ON TABLE contact_submissions IS 'Contact form submissions';

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

-- Site Settings table
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE site_settings IS 'PBR website configurable settings';

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE researcher_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable" ON profiles 
  FOR SELECT USING (true);

-- User roles policies
CREATE POLICY "Users can view own roles" ON user_roles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON user_roles 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Team members policies
CREATE POLICY "Team members are viewable by everyone" ON team_members 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage team members" ON team_members 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Research areas policies
CREATE POLICY "Research areas are viewable by everyone" ON research_areas 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage research areas" ON research_areas 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Publications policies
CREATE POLICY "Publications are viewable by everyone" ON publications 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage publications" ON publications 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Research projects policies
CREATE POLICY "Projects are viewable by everyone" ON research_projects 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage projects" ON research_projects 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Collaborations policies
CREATE POLICY "Collaborations are viewable by everyone" ON collaborations 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage collaborations" ON collaborations 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Contact submissions policies
CREATE POLICY "Anyone can submit contact form" ON contact_submissions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions" ON contact_submissions 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update contact submissions" ON contact_submissions 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Researcher applications policies
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

-- Site settings policies
CREATE POLICY "Site settings are viewable by everyone" ON site_settings 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON site_settings 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 5. VIEWS
-- ============================================

-- Publication stats view
CREATE VIEW publication_stats AS
SELECT 
  COUNT(*) FILTER (WHERE is_active) AS total_publications,
  COALESCE(SUM(citation_count) FILTER (WHERE is_active), 0) AS total_citations,
  COUNT(DISTINCT journal) FILTER (WHERE is_active) AS unique_journals,
  COUNT(*) FILTER (WHERE is_active AND is_featured) AS featured_count
FROM publications;

COMMENT ON VIEW publication_stats IS 'Aggregated publication statistics';

-- Team stats view
CREATE VIEW team_stats AS
SELECT 
  COUNT(*) FILTER (WHERE is_active) AS total_members,
  COUNT(*) FILTER (WHERE is_active AND role ILIKE '%Lead%') AS lead_researchers,
  COUNT(*) FILTER (WHERE is_active AND role ILIKE '%PhD%') AS phd_students,
  COUNT(*) FILTER (WHERE is_active AND role ILIKE '%Research%') AS researchers
FROM team_members;

COMMENT ON VIEW team_stats IS 'Aggregated team member statistics';

-- Project stats view
CREATE VIEW project_stats AS
SELECT 
  COUNT(*) FILTER (WHERE is_active) AS total_projects,
  COUNT(*) FILTER (WHERE is_active AND status = 'Active') AS active_projects,
  COUNT(*) FILTER (WHERE is_active AND status = 'Completed') AS completed_projects,
  COUNT(*) FILTER (WHERE is_active AND status = 'Upcoming') AS upcoming_projects
FROM research_projects;

COMMENT ON VIEW project_stats IS 'Aggregated project statistics';

-- ============================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Insert default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION handle_new_user IS 'Automatically creates profile and assigns student role when a new user signs up';

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 7. DEFAULT DATA
-- ============================================

-- Insert default research areas
INSERT INTO research_areas (title, slug, description, icon, gradient_from, gradient_to, display_order, highlights) VALUES
('In Silico Research', 'in-silico', 'Computational approaches including molecular modeling, bioinformatics, and machine learning for drug discovery and biological analysis.', 'Computer', '#3b82f6', '#8b5cf6', 1, '["Molecular Docking", "MD Simulations", "QSAR Modeling", "AI/ML Drug Discovery"]'),
('In Vitro Research', 'in-vitro', 'Laboratory-based experiments using cell cultures, biochemical assays, and tissue models to study biological processes.', 'Flask', '#10b981', '#14b8a6', 2, '["Cell Culture", "Biochemical Assays", "Protein Analysis", "Drug Screening"]'),
('In Vivo Research', 'in-vivo', 'Studies conducted in living organisms to validate findings and understand complex biological interactions.', 'Heart', '#f59e0b', '#ef4444', 3, '["Animal Models", "Pharmacokinetics", "Toxicology", "Efficacy Studies"]')
ON CONFLICT (slug) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value, description, category) VALUES
('site_name', '"Pharmacology & Biomedical Research"', 'Website name', 'general'),
('site_tagline', '"Advancing Science Through Innovation"', 'Website tagline', 'general'),
('contact_email', '"contact@pbr-research.org"', 'Primary contact email', 'contact'),
('contact_phone', '"+880-XXX-XXXXXXX"', 'Primary contact phone', 'contact'),
('address', '"Department of Pharmacy, University of XYZ"', 'Physical address', 'contact'),
('social_links', '{"facebook": "", "twitter": "", "linkedin": "", "researchgate": ""}', 'Social media links', 'social'),
('hero_stats', '[{"label": "Publications", "value": "50+"}, {"label": "Researchers", "value": "15+"}, {"label": "Projects", "value": "20+"}]', 'Hero section statistics', 'homepage'),
('publication_stats', '{"total": 50, "citations": 500, "hIndex": 12}', 'Publication achievements', 'homepage')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 8. STORAGE BUCKETS
-- ============================================

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
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
-- END OF SCHEMA
-- ============================================
-- Schema setup complete!
-- Next steps:
-- 1. Create your first admin user via Supabase Auth dashboard
-- 2. Run database/grant_admin_access.sql to assign admin role
-- 3. Update environment variables in your project
-- ============================================
