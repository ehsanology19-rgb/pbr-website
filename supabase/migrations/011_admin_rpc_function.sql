-- ============================================
-- Admin RPC function (bypasses RLS)
-- ============================================
-- This function checks if the currently logged-in user has admin role.
-- It uses SECURITY DEFINER to bypass RLS on user_roles table,
-- avoiding the recursive policy issue.

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

COMMENT ON FUNCTION is_admin IS 'Check if the current user has admin role (bypasses RLS)';
