# Supabase Row Level Security (RLS) Guide

Row Level Security (RLS) is essential for securing your Supabase PostgreSQL database. When RLS is enabled on a table, all access is denied by default unless a specific policy grants access.

## General Best Practices

1. **Enable RLS on ALL tables**, even if they are only accessed from the backend via the service role key. This prevents accidental exposure via the anonymous API.
2. **Never use the `service_role` key in the frontend.** Only use the `anon` key on the client side.
3. **Write strict policies** that only grant access when `auth.uid()` matches the required conditions.

## Enabling RLS

To enable RLS on a table (e.g., `events`):

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

## Template Policies

### 1. Public Read-Only Access
Allow anyone (even anonymous users) to read data, but deny inserts/updates/deletes.

```sql
CREATE POLICY "Allow public read access" 
ON events
FOR SELECT 
USING (true);
```

### 2. Authenticated Users Only (Read)
Allow only logged-in users to read data.

```sql
CREATE POLICY "Allow authenticated read access" 
ON profiles
FOR SELECT 
USING (auth.role() = 'authenticated');
```

### 3. User-Specific Access (CRUD)
Allow users to only select, update, or delete their own records. This assumes the table has a `user_id` column referencing `auth.users(id)`.

```sql
-- Select
CREATE POLICY "Users can view their own data" 
ON profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Insert
CREATE POLICY "Users can insert their own data" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update
CREATE POLICY "Users can update their own data" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Delete
CREATE POLICY "Users can delete their own data" 
ON profiles 
FOR DELETE 
USING (auth.uid() = user_id);
```

### 4. Admin-Only Access (Role-Based)
If you have a custom `role` column on a `user_roles` table, you can create a function to check if the current user is an admin.

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use the function in a policy
CREATE POLICY "Admins have full access" 
ON events
FOR ALL 
USING (is_admin());
```
