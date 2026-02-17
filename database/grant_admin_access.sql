-- ============================================
-- Grant Admin Access to User
-- ============================================
-- This script grants admin role to a user by email address.
-- Replace 'your-email@example.com' with the actual admin email.
-- ============================================

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'your-email@example.com'; -- CHANGE THIS EMAIL
BEGIN
  -- Find user ID by email from profiles table
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = target_email;
  
  -- Check if user exists
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in profiles table. Make sure the user has signed up first.', target_email;
  END IF;
  
  -- Delete any existing roles for this user
  DELETE FROM user_roles WHERE user_id = target_user_id;
  
  -- Insert admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin');
  
  RAISE NOTICE 'Admin role granted successfully to user: % (ID: %)', target_email, target_user_id;
END $$;

-- Verify the role was set correctly
SELECT 
  p.email,
  p.full_name,
  ur.role,
  ur.created_at as role_assigned_at
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE p.email = 'your-email@example.com'; -- CHANGE THIS EMAIL

-- ============================================
-- Usage Instructions:
-- ============================================
-- 1. Replace 'your-email@example.com' with your actual admin email (appears twice above)
-- 2. Make sure the user has already signed up (profile exists in profiles table)
-- 3. Run this script in Supabase SQL Editor
-- 4. After running, sign out and sign back in to refresh the role cache
-- 5. Navigate to /dashboard - you should now have admin access
-- ============================================
