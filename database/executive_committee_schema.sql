-- ============================================
-- Executive Committee Members Table
-- ============================================
-- This table stores executive committee members with their roles and wing assignments

CREATE TABLE executive_committee_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  wing TEXT, -- NULL for Advisor and Executive Committee, wing name for others
  member_type TEXT NOT NULL CHECK (member_type IN ('advisor', 'executive', 'wing')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE executive_committee_members IS 'PBR Executive Committee members and wing leaders';

-- Enable RLS
ALTER TABLE executive_committee_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active executive committee members" 
  ON executive_committee_members 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage executive committee members" 
  ON executive_committee_members 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Index for faster queries
CREATE INDEX idx_executive_committee_member_type ON executive_committee_members(member_type, display_order);
CREATE INDEX idx_executive_committee_wing ON executive_committee_members(wing);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_executive_committee_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_executive_committee_updated_at
  BEFORE UPDATE ON executive_committee_members
  FOR EACH ROW
  EXECUTE FUNCTION update_executive_committee_updated_at();
