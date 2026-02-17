-- ============================================
-- Fix: Create RPC function for role access
-- ============================================
-- The RLS policies on user_roles are blocking users from reading
-- their own role. This creates a SECURITY DEFINER function that
-- bypasses RLS to return the authenticated user's role.
-- ============================================

-- 1. Create the RPC function
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_role() TO anon;

-- 3. Also fix the RLS policies on user_roles to be more permissive for SELECT
-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can view roles" ON user_roles;

-- Recreate: allow users to read their own roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Verify: test the function returns the correct role
SELECT get_my_role() AS my_role;

-- ============================================
-- Run this entire script in Supabase SQL Editor
-- Then hard-refresh your website (Ctrl+Shift+R)
-- ============================================
