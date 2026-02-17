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

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Site settings are viewable by everyone" ON site_settings 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON site_settings 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Insert default settings
INSERT INTO site_settings (key, value, description, category) VALUES
('site_name', '"Pharmacology & Biomedical Research"', 'Website name', 'general'),
('site_tagline', '"Advancing Science Through Innovation"', 'Website tagline', 'general'),
('contact_email', '"contact@pbr-research.org"', 'Primary contact email', 'contact'),
('contact_phone', '"+880-XXX-XXXXXXX"', 'Primary contact phone', 'contact'),
('address', '"Department of Pharmacy, University of XYZ"', 'Physical address', 'contact'),
('social_links', '{"facebook": "", "twitter": "", "linkedin": "", "researchgate": ""}', 'Social media links', 'social'),
('hero_stats', '[{"label": "Publications", "value": "50+"}, {"label": "Researchers", "value": "15+"}, {"label": "Projects", "value": "20+"}]', 'Hero section statistics', 'homepage'),
('publication_stats', '{"total": 50, "citations": 500, "hIndex": 12}', 'Publication achievements', 'homepage');
