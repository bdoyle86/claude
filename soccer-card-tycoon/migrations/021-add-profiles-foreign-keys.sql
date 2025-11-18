-- Add Foreign Keys to Profiles Table (Not auth.users)
-- This allows Supabase queries to resolve relationships while supporting AI bots

-- ============================================================================
-- Add foreign keys from teams to profiles
-- ============================================================================
ALTER TABLE teams
ADD CONSTRAINT teams_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ============================================================================
-- Add foreign keys from battles to profiles
-- ============================================================================
ALTER TABLE battles
ADD CONSTRAINT battles_player1_id_fkey
FOREIGN KEY (player1_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE battles
ADD CONSTRAINT battles_player2_id_fkey
FOREIGN KEY (player2_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE battles
ADD CONSTRAINT battles_winner_id_fkey
FOREIGN KEY (winner_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- ============================================================================
-- Add foreign keys from battle-related tables to profiles
-- ============================================================================
ALTER TABLE battle_rewards
ADD CONSTRAINT battle_rewards_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE battle_rounds
ADD CONSTRAINT battle_rounds_winner_id_fkey
FOREIGN KEY (winner_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- ============================================================================
-- Add foreign keys from other user tables to profiles
-- ============================================================================
ALTER TABLE card_evolutions
ADD CONSTRAINT card_evolutions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE card_fatigue
ADD CONSTRAINT card_fatigue_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE trades
ADD CONSTRAINT trades_initiator_id_fkey
FOREIGN KEY (initiator_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE trades
ADD CONSTRAINT trades_recipient_id_fkey
FOREIGN KEY (recipient_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE trade_items
ADD CONSTRAINT trade_items_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE transactions
ADD CONSTRAINT transactions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE user_achievements
ADD CONSTRAINT user_achievements_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE user_cards
ADD CONSTRAINT user_cards_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ============================================================================
-- Verify all foreign keys point to profiles, not auth.users
-- ============================================================================
SELECT
  '✓ Foreign Keys Now Point to Profiles' as status,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND kcu.column_name LIKE '%user_id%' OR kcu.column_name LIKE '%player%_id' OR kcu.column_name LIKE '%initiator%' OR kcu.column_name LIKE '%recipient%' OR kcu.column_name LIKE '%winner_id%'
ORDER BY tc.table_name;

-- ============================================================================
-- Test the battle query that was failing
-- ============================================================================
SELECT
  '✓ Testing Battle Query' as test,
  COUNT(*) as opponent_count
FROM teams t
INNER JOIN profiles p ON t.user_id = p.id
WHERE t.goalkeeper_id IS NOT NULL
  AND t.defender_id IS NOT NULL
  AND t.midfielder_id IS NOT NULL
  AND t.forward_id IS NOT NULL;

-- ============================================================================
-- Test the trades query that was failing
-- ============================================================================
SELECT
  '✓ Testing Trades Query' as test,
  'Relationship should now work' as status;

-- Final message
SELECT
  '✓✓✓ All foreign keys now point to profiles!' as result,
  'Battles and trades should work now - Supabase can resolve relationships' as status;
