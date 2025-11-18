-- Fix RLS Policies for Battle System (Handles Existing Policies)
-- The battle system needs to read other users' teams and profiles for matchmaking

-- Step 1: Drop ALL existing policies on teams table
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'teams'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON teams', policy_record.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
END $$;

-- Step 2: Create fresh policies for teams table
CREATE POLICY "Users can read all teams for battles"
  ON teams FOR SELECT
  TO authenticated
  USING (true);  -- Allow reading all teams

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

-- Step 3: Drop ALL existing policies on profiles table
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_record.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
END $$;

-- Step 4: Create fresh policies for profiles table
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);  -- Allow reading all profiles

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Step 5: Verify policies are correct
SELECT
  'Policies Updated' as status,
  tablename,
  policyname,
  cmd as command,
  CASE
    WHEN qual = 'true' THEN '✓ Allow All (Needed for battles)'
    WHEN qual LIKE '%auth.uid()%' THEN '✓ Own Records Only (Secure)'
    ELSE 'Custom'
  END as access_level
FROM pg_policies
WHERE tablename IN ('teams', 'profiles')
ORDER BY tablename, cmd, policyname;

-- Step 6: Test query that battle system uses
SELECT
  '✓ Testing Battle Matchmaking Query' as test,
  COUNT(*) as available_opponents
FROM teams t
INNER JOIN profiles p ON t.user_id = p.id
WHERE t.goalkeeper_id IS NOT NULL
  AND t.defender_id IS NOT NULL
  AND t.midfielder_id IS NOT NULL
  AND t.forward_id IS NOT NULL;

-- Final message
SELECT '✓ RLS policies fixed - battles should now work!' as result;
