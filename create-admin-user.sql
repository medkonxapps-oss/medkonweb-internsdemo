-- Script to create an admin user
-- Replace 'your-email@example.com' with your actual email address
-- Replace 'your-user-id-here' with the actual user ID from auth.users table

-- First, check your user ID by running:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert the admin role (replace the UUID with your actual user ID):
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES (
  'your-user-id-here', -- Replace with your actual user ID
  'admin',
  'your-user-id-here'  -- Replace with your actual user ID
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Example usage:
-- 1. Sign up for an account in your app
-- 2. Find your user ID: SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
-- 3. Replace 'your-user-id-here' with the actual UUID from step 2
-- 4. Run this script in your Supabase SQL editor