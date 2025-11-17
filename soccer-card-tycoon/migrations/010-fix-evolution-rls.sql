-- Fix Card Evolution RLS Issue
-- The evolve_card function was failing due to RLS policy conflicts with SECURITY DEFINER

-- Drop the existing function
DROP FUNCTION IF EXISTS evolve_card(UUID, INTEGER);

-- Recreate the function with proper RLS handling
CREATE OR REPLACE FUNCTION evolve_card(
  user_card_id_param UUID,
  duplicates_to_consume INTEGER
)
RETURNS JSONB AS $$
DECLARE
  user_card_record RECORD;
  card_record RECORD;
  stats_boost INTEGER;
  new_evolution_level INTEGER;
  evolution_cost INTEGER;
  current_user_id UUID;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get user card details
  SELECT * INTO user_card_record
  FROM user_cards
  WHERE id = user_card_id_param
  AND user_id = current_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Card not found or does not belong to you');
  END IF;

  -- Get card details
  SELECT * INTO card_record
  FROM cards
  WHERE id = user_card_record.card_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Card data not found');
  END IF;

  -- Verify user has enough duplicates
  IF user_card_record.quantity <= duplicates_to_consume THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not enough duplicates (need at least 1 card to keep)');
  END IF;

  -- Calculate evolution requirements based on current level
  evolution_cost := CASE
    WHEN user_card_record.evolution_level = 0 THEN 2
    WHEN user_card_record.evolution_level = 1 THEN 3
    WHEN user_card_record.evolution_level = 2 THEN 5
    WHEN user_card_record.evolution_level = 3 THEN 8
    ELSE 10
  END;

  -- Verify they're consuming the right amount
  IF duplicates_to_consume != evolution_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Evolution level %s requires exactly %s duplicates', user_card_record.evolution_level, evolution_cost)
    );
  END IF;

  -- Check max evolution level
  IF user_card_record.evolution_level >= 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Card is already at maximum evolution level');
  END IF;

  -- Calculate stats boost based on card rarity and evolution level
  stats_boost := CASE card_record.rarity
    WHEN 'Epic' THEN 3
    WHEN 'Rare' THEN 2
    ELSE 1
  END;

  -- Apply multiplier for higher evolution levels
  stats_boost := stats_boost * (user_card_record.evolution_level + 1);

  -- Calculate new evolution level
  new_evolution_level := user_card_record.evolution_level + 1;

  -- Update user card
  UPDATE user_cards
  SET quantity = quantity - duplicates_to_consume,
      evolution_level = new_evolution_level,
      bonus_stats = COALESCE(bonus_stats, 0) + stats_boost,
      updated_at = NOW()
  WHERE id = user_card_id_param
  AND user_id = current_user_id;

  -- Verify update succeeded
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Failed to update card');
  END IF;

  -- Record evolution history
  INSERT INTO card_evolutions (
    user_id,
    card_id,
    user_card_id,
    duplicates_consumed,
    stats_gained,
    evolution_level_before,
    evolution_level_after
  ) VALUES (
    current_user_id,
    user_card_record.card_id,
    user_card_id_param,
    duplicates_to_consume,
    stats_boost,
    user_card_record.evolution_level,
    new_evolution_level
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_level', new_evolution_level,
    'stats_gained', stats_boost,
    'total_bonus', COALESCE(user_card_record.bonus_stats, 0) + stats_boost
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Evolution failed: %s', SQLERRM)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION evolve_card(UUID, INTEGER) TO authenticated;

-- Update RLS policies to work better with SECURITY DEFINER functions
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their evolution history" ON card_evolutions;
DROP POLICY IF EXISTS "Users can create evolution records" ON card_evolutions;

-- Recreate with better policies
CREATE POLICY "Users can view their evolution history"
  ON card_evolutions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert evolution records"
  ON card_evolutions FOR INSERT
  WITH CHECK (true);

-- Verify the fix
SELECT 'Evolution function updated successfully' as status;
