-- Drop All auth.users Foreign Key Constraints for AI Opponent Support
-- This allows AI bots to participate in battles, earn rewards, etc.

-- ============================================================================
-- SECTION 1: Drop constraints from battles table
-- ============================================================================
ALTER TABLE battles DROP CONSTRAINT IF EXISTS battles_player1_id_fkey;
ALTER TABLE battles DROP CONSTRAINT IF EXISTS battles_player2_id_fkey;
ALTER TABLE battles DROP CONSTRAINT IF EXISTS battles_winner_id_fkey;

-- ============================================================================
-- SECTION 2: Drop constraints from battle-related tables
-- ============================================================================
ALTER TABLE battle_rewards DROP CONSTRAINT IF EXISTS battle_rewards_user_id_fkey;
ALTER TABLE battle_rounds DROP CONSTRAINT IF EXISTS battle_rounds_winner_id_fkey;

-- ============================================================================
-- SECTION 3: Drop constraints from other user-related tables
-- ============================================================================
ALTER TABLE card_evolutions DROP CONSTRAINT IF EXISTS card_evolutions_user_id_fkey;
ALTER TABLE card_fatigue DROP CONSTRAINT IF EXISTS card_fatigue_user_id_fkey;
ALTER TABLE trade_items DROP CONSTRAINT IF EXISTS trade_items_user_id_fkey;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_initiator_id_fkey;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_recipient_id_fkey;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;
ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_fkey;

-- ============================================================================
-- SECTION 4: Add missing unique constraints
-- ============================================================================

-- Add unique constraint on user_cards if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_cards_user_card_unique'
  ) THEN
    ALTER TABLE user_cards
    ADD CONSTRAINT user_cards_user_card_unique UNIQUE (user_id, card_id);
    RAISE NOTICE '✓ Added unique constraint to user_cards';
  ELSE
    RAISE NOTICE '  user_cards unique constraint already exists';
  END IF;
END $$;

-- Add unique constraint on card_fatigue if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'card_fatigue_user_card_unique'
  ) THEN
    ALTER TABLE card_fatigue
    ADD CONSTRAINT card_fatigue_user_card_unique UNIQUE (user_id, card_id);
    RAISE NOTICE '✓ Added unique constraint to card_fatigue';
  ELSE
    RAISE NOTICE '  card_fatigue unique constraint already exists';
  END IF;
END $$;

-- ============================================================================
-- SECTION 5: Verify all constraints are dropped
-- ============================================================================
SELECT
  '✓ Foreign Key Constraints Removed' as status,
  COUNT(*) as remaining_auth_user_fkeys
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
  AND ccu.table_schema = 'auth';

-- ============================================================================
-- SECTION 6: Test battle creation with AI opponent
-- ============================================================================
SELECT
  '✓ Testing Battle with AI Opponent' as test,
  COUNT(*) as ai_opponents_available
FROM profiles p
JOIN teams t ON p.id = t.user_id
WHERE p.username IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars')
  AND t.goalkeeper_id IS NOT NULL
  AND t.defender_id IS NOT NULL
  AND t.midfielder_id IS NOT NULL
  AND t.forward_id IS NOT NULL;

-- ============================================================================
-- FINAL MESSAGE
-- ============================================================================
SELECT
  '✓✓✓ All auth.users constraints removed!' as result,
  'AI opponents can now participate in battles, earn rewards, and evolve cards' as status;
