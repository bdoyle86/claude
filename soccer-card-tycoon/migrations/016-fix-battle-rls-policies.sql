-- Fix RLS Policies for Battle System
-- The battle system needs to read other users' teams and profiles for matchmaking

-- Step 1: Update teams table RLS policies to allow reading other teams for battles
DROP POLICY IF EXISTS "Users can view their own team" ON teams;
DROP POLICY IF EXISTS "Users can view all teams" ON teams;
DROP POLICY IF EXISTS "Users can read all teams for battles" ON teams;

-- Create policy to allow users to view ALL teams (needed for battles)
CREATE POLICY "Users can read all teams for battles"
  ON teams FOR SELECT
  TO authenticated
  USING (true);  -- Allow reading all teams

-- Users can only modify their own team
CREATE POLICY "Users can update their own team"
  ON teams FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team"
  ON teams FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 2: Update profiles table RLS policies to allow reading for battles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Create policy to allow users to view ALL profiles (needed for battles/leaderboards)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);  -- Allow reading all profiles

-- Users can only modify their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Step 3: Verify policies are correct
SELECT
  tablename,
  policyname,
  cmd as command,
  CASE
    WHEN qual = 'true' OR qual LIKE '%true%' THEN 'Allow All'
    WHEN qual LIKE '%auth.uid()%' THEN 'Own Records Only'
    ELSE 'Custom'
  END as policy_type
FROM pg_policies
WHERE tablename IN ('teams', 'profiles')
  AND policyname NOT LIKE '%old%'
ORDER BY tablename, cmd, policyname;

-- Step 4: Test query that battle system uses
SELECT
  'Testing Battle Query' as status,
  COUNT(*) as available_opponents
FROM teams t
INNER JOIN profiles p ON t.user_id = p.id
WHERE t.goalkeeper_id IS NOT NULL
  AND t.defender_id IS NOT NULL
  AND t.midfielder_id IS NOT NULL
  AND t.forward_id IS NOT NULL;

-- Step 5: Show message
SELECT '✓ RLS policies updated - all teams and profiles now visible for battles' as result;
