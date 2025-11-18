-- Quick Database Status Check
-- Run this for a fast overview of critical database state

-- Are AI opponents ready?
SELECT '1. AI OPPONENTS' as check_section;
SELECT
  COUNT(*) as bot_count,
  CASE
    WHEN COUNT(*) >= 5 THEN '✓ AI opponents exist'
    ELSE '✗ PROBLEM: Run migration 015 to create AI opponents'
  END as status
FROM profiles
WHERE username IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars');

-- Are card positions correct?
SELECT '2. CARD POSITIONS' as check_section;
SELECT
  position,
  COUNT(*) as count,
  CASE
    WHEN position IN ('GK', 'DEF', 'MID', 'FWD') THEN '✓ Correct'
    ELSE '✗ PROBLEM: Run migration 008'
  END as status
FROM cards
GROUP BY position
ORDER BY position;

-- Can battles work? (RLS check)
SELECT '3. BATTLE READINESS' as check_section;
SELECT
  COUNT(*) as complete_teams,
  CASE
    WHEN COUNT(*) >= 5 THEN '✓ Teams ready for battles'
    ELSE '✗ PROBLEM: Not enough complete teams'
  END as status
FROM teams
WHERE goalkeeper_id IS NOT NULL
  AND defender_id IS NOT NULL
  AND midfielder_id IS NOT NULL
  AND forward_id IS NOT NULL;

-- Do critical columns exist?
SELECT '4. CRITICAL COLUMNS' as check_section;
SELECT
  'user_cards.updated_at' as column_check,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'user_cards' AND column_name = 'updated_at'
    ) THEN '✓ Exists'
    ELSE '✗ MISSING: Run migration 011'
  END as status
UNION ALL
SELECT
  'teams.formation',
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'teams' AND column_name = 'formation'
    ) THEN '✓ Exists'
    ELSE '✗ MISSING: Run migration 007'
  END
UNION ALL
SELECT
  'profiles.elo_rating',
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'elo_rating'
    ) THEN '✓ Exists'
    ELSE '✗ MISSING: Run migration 006'
  END;

-- Do critical functions exist?
SELECT '5. CRITICAL FUNCTIONS' as check_section;
SELECT
  routine_name as function_name,
  '✓ Exists' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
  AND routine_name IN ('evolve_card', 'calculate_elo_change', 'update_ranked_stats', 'check_daily_bonus')
ORDER BY routine_name;

-- Are RLS policies configured for battles?
SELECT '6. RLS POLICIES FOR BATTLES' as check_section;
SELECT
  tablename,
  COUNT(*) as policy_count,
  CASE
    WHEN COUNT(*) FILTER (WHERE cmd = 'SELECT' AND (qual = 'true' OR qual LIKE '%true%')) > 0
    THEN '✓ Can read for battles'
    ELSE '✗ PROBLEM: Run migration 017'
  END as battle_access
FROM pg_policies
WHERE tablename IN ('teams', 'profiles')
GROUP BY tablename
ORDER BY tablename;

-- Final summary
SELECT '═══════════════════════════════════' as divider;
SELECT
  'QUICK CHECK COMPLETE' as result,
  'Look for any ✗ marks above and run suggested migrations' as next_steps;
