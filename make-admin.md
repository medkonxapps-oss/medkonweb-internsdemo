# How to Make Yourself Admin

## Step 1: Get Your User ID
1. Open your app: http://localhost:8080/
2. Sign in to your account
3. Go to Approvals page: `/admin/approvals`
4. Look at the **debug info** (bottom-right corner)
5. Copy your **User ID**

## Step 2: Run SQL Command
1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Go to your project: `dztqvkyfnmnyhvmckxjc`
3. Click **SQL Editor** in sidebar
4. Run this command (replace `YOUR_USER_ID_HERE` with your actual ID):

```sql
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES (
  'YOUR_USER_ID_HERE', -- Replace with your actual user ID
  'admin',
  'YOUR_USER_ID_HERE'  -- Replace with your actual user ID
)
ON CONFLICT (user_id, role) DO NOTHING;
```

## Step 3: Refresh Page
1. Go back to your app
2. Refresh the page
3. Check debug info - it should show "Is Admin: Yes"
4. Now you'll see **Approve** and **Reject** buttons!

## Example:
If your User ID is `123e4567-e89b-12d3-a456-426614174000`, then run:

```sql
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'admin',
  '123e4567-e89b-12d3-a456-426614174000'
)
ON CONFLICT (user_id, role) DO NOTHING;
```