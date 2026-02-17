-- ============================================
-- FIX: Replace all recursive RLS policies
-- ============================================
-- The "Admins can manage..." policies on every table use:
--   EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
-- This causes infinite recursion because user_roles has the same pattern.
-- Fix: Use the is_admin() SECURITY DEFINER function instead.
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor.
-- ============================================

-- Step 0: Make sure is_admin() function exists
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

-- ============================================
-- Fix user_roles policies
-- ============================================
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (is_admin());

-- ============================================
-- Fix team_members policies
-- ============================================
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
CREATE POLICY "Admins can manage team members" ON team_members
  FOR ALL USING (is_admin());

-- ============================================
-- Fix research_areas policies
-- ============================================
DROP POLICY IF EXISTS "Admins can manage research areas" ON research_areas;
CREATE POLICY "Admins can manage research areas" ON research_areas
  FOR ALL USING (is_admin());

-- ============================================
-- Fix publications policies
-- ============================================
DROP POLICY IF EXISTS "Admins can manage publications" ON publications;
CREATE POLICY "Admins can manage publications" ON publications
  FOR ALL USING (is_admin());

-- ============================================
-- Fix research_projects policies
-- ============================================
DROP POLICY IF EXISTS "Admins can manage projects" ON research_projects;
CREATE POLICY "Admins can manage projects" ON research_projects
  FOR ALL USING (is_admin());

-- ============================================
-- Fix collaborations policies
-- ============================================
DROP POLICY IF EXISTS "Admins can manage collaborations" ON collaborations;
CREATE POLICY "Admins can manage collaborations" ON collaborations
  FOR ALL USING (is_admin());

-- ============================================
-- Fix contact_submissions policies
-- ============================================
DROP POLICY IF EXISTS "Admins can view contact submissions" ON contact_submissions;
CREATE POLICY "Admins can view contact submissions" ON contact_submissions
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
CREATE POLICY "Admins can update contact submissions" ON contact_submissions
  FOR UPDATE USING (is_admin());

-- ============================================
-- Fix researcher_applications policies
-- ============================================
DROP POLICY IF EXISTS "Admins can view all applications" ON researcher_applications;
CREATE POLICY "Admins can view all applications" ON researcher_applications
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update applications" ON researcher_applications;
CREATE POLICY "Admins can update applications" ON researcher_applications
  FOR UPDATE USING (is_admin());

-- ============================================
-- Fix site_settings policies
-- ============================================
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings" ON site_settings
  FOR ALL USING (is_admin());

-- ============================================
-- Verify: should show all updated policies
-- ============================================
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE policyname ILIKE '%admin%'
ORDER BY tablename;
