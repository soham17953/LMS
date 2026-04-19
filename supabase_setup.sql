-- Step 1: Create the profiles table
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY, -- Clerk User ID
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('ADMIN', 'STUDENT', 'TEACHER')),
  status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  medium TEXT,
  standards JSONB DEFAULT '[]'::jsonb,
  subjects JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Helper functions for Clerk Auth RLS
-- These must be created BEFORE the policies that use them
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  -- extract the 'sub' claim from the JWT (which corresponds to Clerk user ID)
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::text;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  -- Checks if the user is an admin by looking at their own profile row
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = requesting_user_id() AND role = 'ADMIN' AND status = 'APPROVED'
  );
$$;

-- Step 4: Create RLS Policies
-- To handle Clerk integration, the JWT contains the 'sub' (user ID)

-- 1. Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (requesting_user_id() = id);

-- 2. Users can insert their own profile
CREATE POLICY "Users can create own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (requesting_user_id() = id);

-- 3. Admins can view all profiles
-- Note: Assuming the Admin role can be checked via another query or via a verified JWT claim 
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (is_admin());

-- 4. Admins can update all profiles
CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE 
USING (is_admin());