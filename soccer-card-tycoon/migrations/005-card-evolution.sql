-- Card Evolution/Upgrade System Migration
-- This migration adds evolution capabilities to cards

-- Add evolution columns to user_cards table
ALTER TABLE user_cards
ADD COLUMN IF NOT EXISTS evolution_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_stats INTEGER DEFAULT 0;

-- Create card_evolutions table to track evolution history
CREATE TABLE IF NOT EXISTS card_evolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  user_card_id UUID REFERENCES user_cards(id) ON DELETE CASCADE NOT NULL,
  duplicates_consumed INTEGER NOT NULL,
  stats_gained INTEGER NOT NULL,
  evolution_level_before INTEGER NOT NULL,
  evolution_level_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_card_evolutions_user ON card_evolutions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_evolutions_card ON card_evolutions(card_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_evolution_level ON user_cards(evolution_level);

-- Enable Row Level Security
ALTER TABLE card_evolutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for card_evolutions table
-- Users can view their own evolution history
CREATE POLICY "Users can view their evolution history"
  ON card_evolutions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own evolution records
CREATE POLICY "Users can create evolution records"
  ON card_evolutions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to evolve a card
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
BEGIN
  -- Get user card details
  SELECT * INTO user_card_record
  FROM user_cards
  WHERE id = user_card_id_param
  AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Card not found');
  END IF;

  -- Get card details
  SELECT * INTO card_record
  FROM cards
  WHERE id = user_card_record.card_id;

  -- Verify user has enough duplicates
  IF user_card_record.quantity <= duplicates_to_consume THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not enough duplicates (need at least 1 card to keep)');
  END IF;

  -- Calculate evolution requirements based on current level
  -- Level 0->1: 2 duplicates, Level 1->2: 3 duplicates, Level 2->3: 5 duplicates, etc.
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

  -- Calculate stats boost based on card rarity and evolution level
  stats_boost := CASE card_record.rarity
    WHEN 'Epic' THEN 3
    WHEN 'Rare' THEN 2
    ELSE 1
  END;

  -- Apply multiplier for higher evolution levels
  stats_boost := stats_boost * (user_card_record.evolution_level + 1);

  -- Update user card
  new_evolution_level := user_card_record.evolution_level + 1;

  UPDATE user_cards
  SET quantity = quantity - duplicates_to_consume,
      evolution_level = new_evolution_level,
      bonus_stats = bonus_stats + stats_boost,
      updated_at = NOW()
  WHERE id = user_card_id_param;

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
    auth.uid(),
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
    'total_bonus', user_card_record.bonus_stats + stats_boost
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION evolve_card(UUID, INTEGER) TO authenticated;

-- Create function to calculate effective card rating with evolution bonuses
CREATE OR REPLACE FUNCTION get_effective_rating(
  base_rating INTEGER,
  bonus_stats INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  RETURN LEAST(99, base_rating + bonus_stats);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add some evolution achievements to achievements table if they don't exist
INSERT INTO achievements (name, title, description, category, icon, requirement_type, requirement_value, reward_coins, rarity)
VALUES
  ('first_evolution', 'First Evolution', 'Evolve your first card', 'evolution', 'upgrade', 'evolutions_count', 1, 100, 'common'),
  ('evolution_master', 'Evolution Master', 'Evolve 10 cards', 'evolution', 'auto_awesome', 'evolutions_count', 10, 500, 'rare'),
  ('max_evolution', 'Max Evolution', 'Reach evolution level 5 on any card', 'evolution', 'star', 'max_evolution_level', 5, 1000, 'epic')
ON CONFLICT (name) DO NOTHING;
