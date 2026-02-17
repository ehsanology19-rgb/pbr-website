-- ============================================
-- FIX: Permissions and RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. Create proper policies for profiles
CREATE POLICY "Anyone can view profiles" ON profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- 3. Fix user_roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

CREATE POLICY "Anyone can view roles" ON user_roles 
  FOR SELECT USING (true);

CREATE POLICY "System can insert roles" ON user_roles 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update roles" ON user_roles 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete roles" ON user_roles 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 4. Fix the handle_new_user function to handle errors gracefully
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
  
  -- Insert default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 6. Fix team_members policies for public read
DROP POLICY IF EXISTS "Team members are viewable by everyone" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;

CREATE POLICY "Anyone can view team members" ON team_members 
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert team members" ON team_members 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update team members" ON team_members 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete team members" ON team_members 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 7. Fix all other tables with similar pattern
-- Research Areas
DROP POLICY IF EXISTS "Research areas are viewable by everyone" ON research_areas;
DROP POLICY IF EXISTS "Admins can manage research areas" ON research_areas;

CREATE POLICY "Anyone can view research areas" ON research_areas FOR SELECT USING (true);
CREATE POLICY "Admins can insert research areas" ON research_areas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update research areas" ON research_areas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete research areas" ON research_areas FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Publications
DROP POLICY IF EXISTS "Publications are viewable by everyone" ON publications;
DROP POLICY IF EXISTS "Admins can manage publications" ON publications;

CREATE POLICY "Anyone can view publications" ON publications FOR SELECT USING (true);
CREATE POLICY "Admins can insert publications" ON publications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update publications" ON publications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete publications" ON publications FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Research Projects
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON research_projects;
DROP POLICY IF EXISTS "Admins can manage projects" ON research_projects;

CREATE POLICY "Anyone can view projects" ON research_projects FOR SELECT USING (true);
CREATE POLICY "Admins can insert projects" ON research_projects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update projects" ON research_projects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete projects" ON research_projects FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Collaborations
DROP POLICY IF EXISTS "Collaborations are viewable by everyone" ON collaborations;
DROP POLICY IF EXISTS "Admins can manage collaborations" ON collaborations;

CREATE POLICY "Anyone can view collaborations" ON collaborations FOR SELECT USING (true);
CREATE POLICY "Admins can insert collaborations" ON collaborations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update collaborations" ON collaborations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete collaborations" ON collaborations FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Site Settings
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;

CREATE POLICY "Anyone can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert site settings" ON site_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update site settings" ON site_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete site settings" ON site_settings FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 8. Make views accessible
GRANT SELECT ON team_stats TO anon, authenticated;
GRANT SELECT ON publication_stats TO anon, authenticated;
GRANT SELECT ON project_stats TO anon, authenticated;

-- Done!
SELECT 'Permissions fixed successfully!' as status;
