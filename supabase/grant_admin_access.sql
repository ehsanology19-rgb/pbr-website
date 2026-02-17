-- ============================================
-- Grant Admin Access to User
-- Run this in Supabase SQL Editor
-- ============================================

-- Replace 'ehsanology19@gmail.com' with your email if different
-- This will:
-- 1. Find your user ID from profiles table
-- 2. Delete any existing roles for your user
-- 3. Insert admin role for your user

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user ID by email
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = 'ehsanology19@gmail.com';
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email ehsanology19@gmail.com not found in profiles table';
  END IF;
  
  -- Delete existing roles
  DELETE FROM user_roles WHERE user_id = target_user_id;
  
  -- Insert admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin');
  
  RAISE NOTICE 'Admin role granted to user: %', target_user_id;
END $$;

-- Verify the role was set correctly
SELECT 
  p.email,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE p.email = 'ehsanology19@gmail.com';
