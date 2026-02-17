-- ============================================
-- Grant Admin Access
-- ============================================
-- Run this ENTIRE script in your Supabase SQL Editor
-- https://supabase.com/dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================

-- Step 1: Create the is_admin() RPC function (required for the dashboard)
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

-- Step 2: Grant admin role to Ehsan Lab
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'
FROM public.profiles p
WHERE p.email = 'insilicology@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Grant admin role to Toru Oikawa
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'
FROM public.profiles p
WHERE p.email = '2024ehsan@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Verify both admins were granted
SELECT p.full_name, p.email, ur.role, ur.created_at
FROM public.user_roles ur
JOIN public.profiles p ON p.id = ur.user_id
WHERE ur.role = 'admin';
