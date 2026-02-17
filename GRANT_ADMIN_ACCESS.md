# Grant Admin Access

Your user account (`ehsanology19@gmail.com`) currently has `student` role in the database, but you need `admin` role to access the dashboard.

## Quick Fix - Run SQL in Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Run this SQL script:

```sql
-- Grant admin access to ehsanology19@gmail.com
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user ID by email
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = 'ehsanology19@gmail.com';
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email ehsanology19@gmail.com not found';
  END IF;
  
  -- Delete existing roles
  DELETE FROM user_roles WHERE user_id = target_user_id;
  
  -- Insert admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin');
  
  RAISE NOTICE 'Admin role granted to user: %', target_user_id;
END $$;
```

4. **After running the SQL**, you need to:
   - **Sign out** from the website
   - **Sign back in** (this clears the cached role)
   - Navigate to `/dashboard` - you should now have admin access!

## Alternative: Use Supabase Dashboard

1. Go to Supabase Dashboard → **Table Editor** → `user_roles`
2. Find the row with `user_id` matching your user ID (from `profiles` table where `email = 'ehsanology19@gmail.com'`)
3. Edit the `role` column to `admin`
4. Or delete the existing row and insert a new one with `role = 'admin'`

## Verify Your Role

Run this query to check your current role:

```sql
SELECT 
  p.email,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE p.email = 'ehsanology19@gmail.com';
```

It should show `role: admin` after running the SQL script above.
