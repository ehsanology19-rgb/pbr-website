-- ============================================
-- Grant Admin Access to User
-- ============================================
-- This script grants admin role to: ehsanul isalm (ehsanology19@gmail.com)
-- User ID: e54e9ccb-6abb-40c4-90f2-c7bf0dd708fa
-- ============================================

DO $$
DECLARE
  target_user_id UUID := 'e54e9ccb-6abb-40c4-90f2-c7bf0dd708fa';
  target_email TEXT := 'ehsanology19@gmail.com';
BEGIN
  -- Verify user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User with ID % not found in profiles table.', target_user_id;
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
  p.id,
  p.email,
  p.full_name,
  ur.role,
  ur.created_at as role_assigned_at
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE p.id = 'e54e9ccb-6abb-40c4-90f2-c7bf0dd708fa';

-- ============================================
-- Instructions:
-- ============================================
-- 1. Copy and paste this entire script into Supabase SQL Editor
-- 2. Click "Run" to execute
-- 3. After running, sign out and sign back in to refresh the role cache
-- 4. Navigate to /dashboard - you should now have admin access!
-- ============================================
