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

-- Enable RLS
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Publications are viewable by everyone" ON publications 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage publications" ON publications 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- View for publication stats
CREATE VIEW publication_stats AS
SELECT 
  COUNT(*) FILTER (WHERE is_active) AS total_publications,
  COALESCE(SUM(citation_count) FILTER (WHERE is_active), 0) AS total_citations,
  COUNT(DISTINCT journal) FILTER (WHERE is_active) AS unique_journals,
  COUNT(*) FILTER (WHERE is_active AND is_featured) AS featured_count
FROM publications;
