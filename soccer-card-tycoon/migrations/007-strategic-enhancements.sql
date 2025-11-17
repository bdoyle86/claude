-- Strategic Enhancements Migration
-- Adds formations, weather conditions, fatigue system, and battle rewards

-- Step 1: Add formation support to teams table
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS formation TEXT DEFAULT '1-2-1'; -- '1-1-2', '1-2-1', '2-1-1'

-- Step 2: Add weather/field conditions to battles table
ALTER TABLE battles
ADD COLUMN IF NOT EXISTS weather_condition TEXT DEFAULT 'neutral', -- 'rainy', 'sunny', 'neutral'
ADD COLUMN IF NOT EXISTS critical_hits JSONB DEFAULT '[]', -- Track critical hits
ADD COLUMN IF NOT EXISTS miracle_saves JSONB DEFAULT '[]'; -- Track miracle saves

-- Step 3: Create card_fatigue table to track card usage and rest
CREATE TABLE IF NOT EXISTS card_fatigue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  battles_since_rest INTEGER DEFAULT 0,
  last_battle_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- Step 4: Add daily bonus tracking to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_win_date DATE,
ADD COLUMN IF NOT EXISTS daily_bonus_claimed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_card_drops INTEGER DEFAULT 0;

-- Step 5: Create battle_rewards table for tracking drops
CREATE TABLE IF NOT EXISTS battle_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_type TEXT NOT NULL, -- 'coins', 'card_drop', 'daily_bonus', 'streak_bonus'
  reward_value INTEGER, -- For coins
  card_id UUID REFERENCES cards(id), -- For card drops
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Enable RLS on new tables
ALTER TABLE card_fatigue ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_rewards ENABLE ROW LEVEL SECURITY;

-- Step 7: RLS Policies for card_fatigue
CREATE POLICY "Users can view their own card fatigue"
  ON card_fatigue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own card fatigue"
  ON card_fatigue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own card fatigue"
  ON card_fatigue FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 8: RLS Policies for battle_rewards
CREATE POLICY "Users can view their own battle rewards"
  ON battle_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert battle rewards"
  ON battle_rewards FOR INSERT
  WITH CHECK (true);

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_fatigue_user ON card_fatigue(user_id);
CREATE INDEX IF NOT EXISTS idx_card_fatigue_card ON card_fatigue(card_id);
CREATE INDEX IF NOT EXISTS idx_card_fatigue_battles ON card_fatigue(battles_since_rest);
CREATE INDEX IF NOT EXISTS idx_battle_rewards_user ON battle_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_rewards_battle ON battle_rewards(battle_id);
CREATE INDEX IF NOT EXISTS idx_profiles_last_win ON profiles(last_win_date);

-- Step 10: Create function to get formation bonuses
CREATE OR REPLACE FUNCTION get_formation_bonuses(formation_type TEXT)
RETURNS JSONB AS $$
BEGIN
  CASE formation_type
    WHEN '1-1-2' THEN
      RETURN jsonb_build_object(
        'attack_bonus', 10,
        'defense_bonus', -10,
        'description', 'Offensive Formation'
      );
    WHEN '2-1-1' THEN
      RETURN jsonb_build_object(
        'attack_bonus', -10,
        'defense_bonus', 10,
        'description', 'Defensive Formation'
      );
    WHEN '1-2-1' THEN
      RETURN jsonb_build_object(
        'attack_bonus', 0,
        'defense_bonus', 0,
        'description', 'Balanced Formation'
      );
    ELSE
      RETURN jsonb_build_object(
        'attack_bonus', 0,
        'defense_bonus', 0,
        'description', 'Unknown Formation'
      );
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 11: Create function to get weather bonuses
CREATE OR REPLACE FUNCTION get_weather_bonuses(weather TEXT, position TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE weather
    WHEN 'rainy' THEN
      -- Defenders get +15% in rain
      IF position = 'DEF' THEN
        RETURN 15;
      END IF;
    WHEN 'sunny' THEN
      -- Attackers (FWD) get +15% in sun
      IF position = 'FWD' THEN
        RETURN 15;
      END IF;
    ELSE
      RETURN 0;
  END CASE;
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 12: Create function to calculate fatigue penalty
CREATE OR REPLACE FUNCTION get_fatigue_penalty(
  user_id_param UUID,
  card_id_param UUID
)
RETURNS INTEGER AS $$
DECLARE
  battles_count INTEGER;
BEGIN
  SELECT battles_since_rest INTO battles_count
  FROM card_fatigue
  WHERE user_id = user_id_param AND card_id = card_id_param;

  -- If no record, no fatigue
  IF battles_count IS NULL THEN
    RETURN 0;
  END IF;

  -- 5% penalty per battle, max 50%
  RETURN LEAST(battles_count * 5, 50);
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 13: Create function to update card fatigue after battle
CREATE OR REPLACE FUNCTION update_card_fatigue(
  user_id_param UUID,
  card_ids UUID[]
)
RETURNS void AS $$
DECLARE
  card_id_var UUID;
BEGIN
  FOREACH card_id_var IN ARRAY card_ids
  LOOP
    INSERT INTO card_fatigue (user_id, card_id, battles_since_rest, last_battle_at, updated_at)
    VALUES (user_id_param, card_id_var, 1, NOW(), NOW())
    ON CONFLICT (user_id, card_id)
    DO UPDATE SET
      battles_since_rest = card_fatigue.battles_since_rest + 1,
      last_battle_at = NOW(),
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 14: Create function to rest cards
CREATE OR REPLACE FUNCTION rest_card(
  user_id_param UUID,
  card_id_param UUID
)
RETURNS void AS $$
BEGIN
  UPDATE card_fatigue
  SET battles_since_rest = 0,
      updated_at = NOW()
  WHERE user_id = user_id_param AND card_id = card_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 15: Create function to check and grant daily bonus
CREATE OR REPLACE FUNCTION check_daily_bonus(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  last_win DATE;
  today DATE;
  bonus_eligible BOOLEAN;
BEGIN
  today := CURRENT_DATE;

  SELECT last_win_date INTO last_win
  FROM profiles
  WHERE id = user_id_param;

  -- Check if eligible (no win today yet)
  bonus_eligible := (last_win IS NULL OR last_win < today);

  RETURN jsonb_build_object(
    'eligible', bonus_eligible,
    'last_win_date', last_win,
    'today', today
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 16: Create function to claim daily bonus
CREATE OR REPLACE FUNCTION claim_daily_bonus(
  user_id_param UUID,
  battle_id_param UUID
)
RETURNS JSONB AS $$
DECLARE
  bonus_check JSONB;
  bonus_amount INTEGER := 500; -- First win bonus amount
BEGIN
  -- Check eligibility
  bonus_check := check_daily_bonus(user_id_param);

  IF NOT (bonus_check->>'eligible')::BOOLEAN THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Daily bonus already claimed'
    );
  END IF;

  -- Update profile
  UPDATE profiles
  SET last_win_date = CURRENT_DATE,
      coins = coins + bonus_amount
  WHERE id = user_id_param;

  -- Record reward
  INSERT INTO battle_rewards (battle_id, user_id, reward_type, reward_value)
  VALUES (battle_id_param, user_id_param, 'daily_bonus', bonus_amount);

  RETURN jsonb_build_object(
    'success', true,
    'bonus_amount', bonus_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 17: Grant execute permissions
GRANT EXECUTE ON FUNCTION get_formation_bonuses(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weather_bonuses(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_fatigue_penalty(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_card_fatigue(UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION rest_card(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_daily_bonus(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION claim_daily_bonus(UUID, UUID) TO authenticated;
