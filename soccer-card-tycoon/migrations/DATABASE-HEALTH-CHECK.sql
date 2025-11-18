-- Comprehensive Database Health Check
-- Run this in Supabase SQL Editor to review your entire database

-- ============================================================================
-- SECTION 1: TABLE OVERVIEW
-- ============================================================================
SELECT '========== TABLE OVERVIEW ==========' as section;

SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- SECTION 2: TABLE COLUMNS AND TYPES
-- ============================================================================
SELECT '========== KEY TABLES STRUCTURE ==========' as section;

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('cards', 'user_cards', 'teams', 'profiles', 'battles', 'trades', 'achievements', 'user_achievements', 'card_evolutions', 'card_fatigue', 'battle_rewards')
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- SECTION 3: FOREIGN KEY CONSTRAINTS
-- ============================================================================
SELECT '========== FOREIGN KEY CONSTRAINTS ==========' as section;

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- SECTION 4: RLS POLICIES
-- ============================================================================
SELECT '========== RLS POLICIES ==========' as section;

SELECT
  tablename,
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- ============================================================================
-- SECTION 5: INDEXES
-- ============================================================================
SELECT '========== INDEXES ==========' as section;

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('cards', 'user_cards', 'teams', 'profiles', 'battles', 'trades', 'card_evolutions')
ORDER BY tablename, indexname;

-- ============================================================================
-- SECTION 6: DATA COUNTS
-- ============================================================================
SELECT '========== DATA COUNTS ==========' as section;

SELECT 'cards' as table_name, COUNT(*) as row_count FROM cards
UNION ALL
SELECT 'user_cards', COUNT(*) FROM user_cards
UNION ALL
SELECT 'teams', COUNT(*) FROM teams
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'battles', COUNT(*) FROM battles
UNION ALL
SELECT 'trades', COUNT(*) FROM trades
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'user_achievements', COUNT(*) FROM user_achievements
UNION ALL
SELECT 'card_evolutions', COUNT(*) FROM card_evolutions
UNION ALL
SELECT 'packs', COUNT(*) FROM packs
UNION ALL
SELECT 'battle_rewards', COUNT(*) FROM battle_rewards
UNION ALL
SELECT 'card_fatigue', COUNT(*) FROM card_fatigue;

-- ============================================================================
-- SECTION 7: CARD POSITION DISTRIBUTION
-- ============================================================================
SELECT '========== CARD POSITION DISTRIBUTION ==========' as section;

SELECT
  position,
  rarity,
  COUNT(*) as count
FROM cards
GROUP BY position, rarity
ORDER BY position, rarity;

-- ============================================================================
-- SECTION 8: AI OPPONENTS CHECK
-- ============================================================================
SELECT '========== AI OPPONENTS ==========' as section;

SELECT
  p.username,
  p.elo_rating,
  p.coins,
  t.formation,
  CASE
    WHEN t.goalkeeper_id IS NOT NULL AND t.defender_id IS NOT NULL
         AND t.midfielder_id IS NOT NULL AND t.forward_id IS NOT NULL
    THEN '✓ Complete'
    ELSE '✗ Incomplete'
  END as team_status
FROM profiles p
LEFT JOIN teams t ON p.id = t.user_id
WHERE p.username IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars')
ORDER BY p.elo_rating DESC;

-- ============================================================================
-- SECTION 9: USER TEAMS CHECK
-- ============================================================================
SELECT '========== USER TEAMS ==========' as section;

SELECT
  p.username,
  p.coins,
  p.elo_rating,
  t.formation,
  CASE
    WHEN t.goalkeeper_id IS NOT NULL THEN '✓' ELSE '✗'
  END as has_gk,
  CASE
    WHEN t.defender_id IS NOT NULL THEN '✓' ELSE '✗'
  END as has_def,
  CASE
    WHEN t.midfielder_id IS NOT NULL THEN '✓' ELSE '✗'
  END as has_mid,
  CASE
    WHEN t.forward_id IS NOT NULL THEN '✓' ELSE '✗'
  END as has_fwd
FROM profiles p
LEFT JOIN teams t ON p.id = t.user_id
WHERE p.username NOT IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars')
ORDER BY p.username;

-- ============================================================================
-- SECTION 10: MISSING COLUMNS CHECK
-- ============================================================================
SELECT '========== CHECKING FOR MISSING COLUMNS ==========' as section;

-- Check if user_cards has updated_at
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'user_cards' AND column_name = 'updated_at'
    ) THEN '✓ user_cards.updated_at exists'
    ELSE '✗ user_cards.updated_at MISSING - run migration 011'
  END as check_result
UNION ALL
-- Check if teams has formation
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'teams' AND column_name = 'formation'
    ) THEN '✓ teams.formation exists'
    ELSE '✗ teams.formation MISSING - run migration 007'
  END
UNION ALL
-- Check if profiles has elo_rating
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'elo_rating'
    ) THEN '✓ profiles.elo_rating exists'
    ELSE '✗ profiles.elo_rating MISSING - run migration 006'
  END
UNION ALL
-- Check if profiles has last_win_date
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'last_win_date'
    ) THEN '✓ profiles.last_win_date exists'
    ELSE '✗ profiles.last_win_date MISSING - run migration 007'
  END;

-- ============================================================================
-- SECTION 11: FUNCTIONS CHECK
-- ============================================================================
SELECT '========== DATABASE FUNCTIONS ==========' as section;

SELECT
  routine_name as function_name,
  routine_type as type,
  data_type as returns
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
  AND routine_name IN (
    'evolve_card',
    'calculate_elo_change',
    'update_ranked_stats',
    'accept_trade',
    'check_daily_bonus',
    'claim_daily_bonus',
    'get_formation_bonuses',
    'get_weather_bonuses',
    'get_fatigue_penalty'
  )
ORDER BY routine_name;

-- ============================================================================
-- SECTION 12: POTENTIAL ISSUES
-- ============================================================================
SELECT '========== POTENTIAL ISSUES CHECK ==========' as section;

-- Check for cards without positions
SELECT
  '⚠ Cards without proper positions' as issue,
  COUNT(*) as count
FROM cards
WHERE position NOT IN ('GK', 'DEF', 'MID', 'FWD')
HAVING COUNT(*) > 0
UNION ALL
-- Check for incomplete teams
SELECT
  '⚠ Incomplete teams (missing positions)',
  COUNT(*)
FROM teams
WHERE goalkeeper_id IS NULL
   OR defender_id IS NULL
   OR midfielder_id IS NULL
   OR forward_id IS NULL
HAVING COUNT(*) > 0
UNION ALL
-- Check if any profiles lack teams
SELECT
  '⚠ Profiles without teams',
  COUNT(*)
FROM profiles p
LEFT JOIN teams t ON p.id = t.user_id
WHERE t.id IS NULL
  AND p.username NOT IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars');

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================
SELECT '========== HEALTH CHECK COMPLETE ==========' as section;

SELECT
  'Database Review Complete!' as status,
  'Check sections above for any ✗ marks or ⚠ warnings' as action;
