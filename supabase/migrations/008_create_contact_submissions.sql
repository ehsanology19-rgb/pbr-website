-- Contact status enum
CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'resolved', 'closed');

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

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
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
