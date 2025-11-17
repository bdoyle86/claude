-- Battle Enhancements Migration
-- Adds positions, battle modes, ranked system, and interactive battles

-- Step 1: Add position-based team structure
-- Drop old team structure and create new one with positions
DROP TABLE IF EXISTS teams CASCADE;

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  goalkeeper_id UUID REFERENCES cards(id),
  defender_id UUID REFERENCES cards(id),
  midfielder_id UUID REFERENCES cards(id),
  forward_id UUID REFERENCES cards(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add battle-related columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS elo_rating INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS win_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ranked_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ranked_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS casual_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS casual_losses INTEGER DEFAULT 0;

-- Step 3: Update battles table to support new battle system
ALTER TABLE battles
ADD COLUMN IF NOT EXISTS battle_mode TEXT DEFAULT 'casual', -- 'casual', 'ranked', 'wager'
ADD COLUMN IF NOT EXISTS wager_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rounds JSONB, -- Store round-by-round results
ADD COLUMN IF NOT EXISTS abilities_used JSONB, -- Track which abilities were used
ADD COLUMN IF NOT EXISTS elo_change INTEGER DEFAULT 0;

-- Step 4: Create battle_rounds table for detailed round tracking
CREATE TABLE IF NOT EXISTS battle_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  matchup_type TEXT NOT NULL, -- 'goalkeeper', 'defender', 'midfielder', 'forward'
  player1_card_id UUID REFERENCES cards(id),
  player2_card_id UUID REFERENCES cards(id),
  player1_card_power INTEGER,
  player2_card_power INTEGER,
  player1_ability_used TEXT,
  player2_ability_used TEXT,
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Enable RLS on new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_rounds ENABLE ROW LEVEL SECURITY;

-- Step 6: RLS Policies for teams
CREATE POLICY "Users can view all teams"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own team"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team"
  ON teams FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 7: RLS Policies for battle_rounds
CREATE POLICY "Users can view battle rounds for their battles"
  ON battle_rounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM battles
      WHERE battles.id = battle_rounds.battle_id
      AND (battles.player1_id = auth.uid() OR battles.player2_id = auth.uid())
    )
  );

CREATE POLICY "System can insert battle rounds"
  ON battle_rounds FOR INSERT
  WITH CHECK (true);

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_user ON teams(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_rounds_battle ON battle_rounds(battle_id);
CREATE INDEX IF NOT EXISTS idx_battles_mode ON battles(battle_mode);
CREATE INDEX IF NOT EXISTS idx_profiles_elo ON profiles(elo_rating DESC);

-- Step 9: Create function to calculate ELO rating change
CREATE OR REPLACE FUNCTION calculate_elo_change(
  player_elo INTEGER,
  opponent_elo INTEGER,
  player_won BOOLEAN
)
RETURNS INTEGER AS $$
DECLARE
  k_factor INTEGER := 32;
  expected_score NUMERIC;
  actual_score INTEGER;
  elo_change INTEGER;
BEGIN
  -- Calculate expected score (probability of winning)
  expected_score := 1.0 / (1.0 + POWER(10.0, (opponent_elo - player_elo) / 400.0));

  -- Actual score (1 for win, 0 for loss)
  actual_score := CASE WHEN player_won THEN 1 ELSE 0 END;

  -- Calculate ELO change
  elo_change := ROUND(k_factor * (actual_score - expected_score));

  RETURN elo_change;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 10: Create function to update ranked stats after battle
CREATE OR REPLACE FUNCTION update_ranked_stats(
  battle_id_param UUID
)
RETURNS JSONB AS $$
DECLARE
  battle_record RECORD;
  player1_elo_change INTEGER;
  player2_elo_change INTEGER;
BEGIN
  -- Get battle details
  SELECT * INTO battle_record FROM battles WHERE id = battle_id_param;

  -- Only update for ranked battles
  IF battle_record.battle_mode != 'ranked' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not a ranked battle');
  END IF;

  -- Get current ELO ratings
  DECLARE
    player1_elo INTEGER;
    player2_elo INTEGER;
    player1_won BOOLEAN;
  BEGIN
    SELECT elo_rating INTO player1_elo FROM profiles WHERE id = battle_record.player1_id;
    SELECT elo_rating INTO player2_elo FROM profiles WHERE id = battle_record.player2_id;

    player1_won := (battle_record.winner_id = battle_record.player1_id);

    -- Calculate ELO changes
    player1_elo_change := calculate_elo_change(player1_elo, player2_elo, player1_won);
    player2_elo_change := calculate_elo_change(player2_elo, player1_elo, NOT player1_won);

    -- Update player 1
    IF player1_won THEN
      UPDATE profiles
      SET elo_rating = elo_rating + player1_elo_change,
          win_streak = win_streak + 1,
          ranked_wins = ranked_wins + 1
      WHERE id = battle_record.player1_id;
    ELSE
      UPDATE profiles
      SET elo_rating = elo_rating + player1_elo_change,
          win_streak = 0,
          ranked_losses = ranked_losses + 1
      WHERE id = battle_record.player1_id;
    END IF;

    -- Update player 2
    IF NOT player1_won THEN
      UPDATE profiles
      SET elo_rating = elo_rating + player2_elo_change,
          win_streak = win_streak + 1,
          ranked_wins = ranked_wins + 1
      WHERE id = battle_record.player2_id;
    ELSE
      UPDATE profiles
      SET elo_rating = elo_rating + player2_elo_change,
          win_streak = 0,
          ranked_losses = ranked_losses + 1
      WHERE id = battle_record.player2_id;
    END IF;

    -- Update battle record with ELO change
    UPDATE battles
    SET elo_change = player1_elo_change
    WHERE id = battle_id_param;

    RETURN jsonb_build_object(
      'success', true,
      'player1_elo_change', player1_elo_change,
      'player2_elo_change', player2_elo_change
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_elo_change(INTEGER, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_ranked_stats(UUID) TO authenticated;
