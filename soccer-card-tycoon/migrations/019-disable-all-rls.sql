-- Disable All Row Level Security for Testing
-- WARNING: This removes all security - only use for development/testing!

-- Disable RLS on all public tables
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE battle_rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE battle_rounds DISABLE ROW LEVEL SECURITY;
ALTER TABLE battles DISABLE ROW LEVEL SECURITY;
ALTER TABLE card_evolutions DISABLE ROW LEVEL SECURITY;
ALTER TABLE card_fatigue DISABLE ROW LEVEL SECURITY;
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE packs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE trade_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE trades DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled on all tables
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '✗ RLS Still Enabled'
    ELSE '✓ RLS Disabled'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Test battle query
SELECT
  '✓ Testing Battle Matchmaking' as test,
  COUNT(*) as available_opponents
FROM teams t
INNER JOIN profiles p ON t.user_id = p.id
WHERE t.goalkeeper_id IS NOT NULL
  AND t.defender_id IS NOT NULL
  AND t.midfielder_id IS NOT NULL
  AND t.forward_id IS NOT NULL;

-- Show AI opponents
SELECT
  '✓ AI Opponents Status' as section,
  p.username,
  p.elo_rating,
  t.formation,
  'Ready for Battle' as status
FROM profiles p
JOIN teams t ON p.id = t.user_id
WHERE p.username IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars')
ORDER BY p.elo_rating DESC;

-- Final message
SELECT
  '✓✓✓ RLS DISABLED - All security removed' as result,
  'Battles should now work. Re-enable RLS later for production!' as warning;
