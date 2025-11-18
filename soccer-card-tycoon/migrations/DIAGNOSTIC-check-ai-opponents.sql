-- Diagnostic Query: Check if AI Opponents Exist and Are Accessible
-- Run this to verify AI opponents were created properly

-- Step 1: Check if bot profiles exist
SELECT 'Bot Profiles' as check_type, COUNT(*) as count
FROM profiles
WHERE username IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars');

-- Step 2: Check if bot teams exist
SELECT 'Bot Teams' as check_type, COUNT(*) as count
FROM teams t
JOIN profiles p ON t.user_id = p.id
WHERE p.username IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars');

-- Step 3: Show detailed bot team info
SELECT
  p.id as user_id,
  p.username,
  p.elo_rating,
  t.formation,
  t.goalkeeper_id,
  t.defender_id,
  t.midfielder_id,
  t.forward_id,
  CASE
    WHEN t.goalkeeper_id IS NOT NULL AND t.defender_id IS NOT NULL
         AND t.midfielder_id IS NOT NULL AND t.forward_id IS NOT NULL
    THEN 'Complete'
    ELSE 'Incomplete'
  END as status
FROM profiles p
LEFT JOIN teams t ON p.id = t.user_id
WHERE p.username IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars')
ORDER BY p.elo_rating DESC;

-- Step 4: Test the exact query the battle system uses
-- This simulates what the app does - replace 'YOUR_USER_ID' with your actual user ID
SELECT t.*, p.username, p.elo_rating
FROM teams t
INNER JOIN profiles p ON t.user_id = p.id
WHERE t.user_id != 'YOUR_USER_ID'::uuid  -- Replace with your user ID
LIMIT 20;

-- Step 5: Check RLS policies on teams table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('teams', 'profiles')
ORDER BY tablename, policyname;
