-- Fix infinite recursion in RLS policies
-- All admin policies were using a direct subquery on user_roles,
-- which caused infinite recursion. Replace with is_admin() function.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
CREATE POLICY "Admins can manage team members" ON team_members FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage research areas" ON research_areas;
CREATE POLICY "Admins can manage research areas" ON research_areas FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage publications" ON publications;
CREATE POLICY "Admins can manage publications" ON publications FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage projects" ON research_projects;
CREATE POLICY "Admins can manage projects" ON research_projects FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage collaborations" ON collaborations;
CREATE POLICY "Admins can manage collaborations" ON collaborations FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins can view contact submissions" ON contact_submissions;
CREATE POLICY "Admins can view contact submissions" ON contact_submissions FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
CREATE POLICY "Admins can update contact submissions" ON contact_submissions FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can view all applications" ON researcher_applications;
CREATE POLICY "Admins can view all applications" ON researcher_applications FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update applications" ON researcher_applications;
CREATE POLICY "Admins can update applications" ON researcher_applications FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL USING (is_admin());
