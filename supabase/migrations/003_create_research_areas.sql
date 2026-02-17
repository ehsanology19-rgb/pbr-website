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

-- Enable RLS
ALTER TABLE research_areas ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Research areas are viewable by everyone" ON research_areas 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage research areas" ON research_areas 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Insert default research areas
INSERT INTO research_areas (title, slug, description, icon, gradient_from, gradient_to, display_order, highlights) VALUES
('In Silico Research', 'in-silico', 'Computational approaches including molecular modeling, bioinformatics, and machine learning for drug discovery and biological analysis.', 'Computer', '#3b82f6', '#8b5cf6', 1, '["Molecular Docking", "MD Simulations", "QSAR Modeling", "AI/ML Drug Discovery"]'),
('In Vitro Research', 'in-vitro', 'Laboratory-based experiments using cell cultures, biochemical assays, and tissue models to study biological processes.', 'Flask', '#10b981', '#14b8a6', 2, '["Cell Culture", "Biochemical Assays", "Protein Analysis", "Drug Screening"]'),
('In Vivo Research', 'in-vivo', 'Studies conducted in living organisms to validate findings and understand complex biological interactions.', 'Heart', '#f59e0b', '#ef4444', 3, '["Animal Models", "Pharmacokinetics", "Toxicology", "Efficacy Studies"]');
