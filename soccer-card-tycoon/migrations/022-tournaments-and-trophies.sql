-- Tournaments and Trophy System Migration

-- Create tournaments table for different cup types
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  difficulty INTEGER NOT NULL, -- 1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Legendary
  required_elo INTEGER DEFAULT 0, -- Minimum ELO to enter
  entry_fee INTEGER DEFAULT 0, -- Coins required to enter
  reward_coins INTEGER DEFAULT 500,
  reward_trophy BOOLEAN DEFAULT true,
  rounds INTEGER DEFAULT 3, -- Number of opponents to beat
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user tournament progress table
CREATE TABLE IF NOT EXISTS user_tournament_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  current_round INTEGER DEFAULT 0, -- 0-based, 0 means just started
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'won', 'lost'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, tournament_id, status) -- User can only have one active progress per tournament
);

-- Create user trophies table
CREATE TABLE IF NOT EXISTS user_trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  won_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tournament_id) -- Can only win each tournament once
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_tournament_progress_user ON user_tournament_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tournament_progress_status ON user_tournament_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_trophies_user ON user_trophies(user_id);

-- Seed tournament cups with progressive difficulty
INSERT INTO tournaments (name, description, difficulty, required_elo, entry_fee, reward_coins, rounds) VALUES
  ('Rookie Cup', 'Perfect for beginners! Face 3 easy AI opponents and earn your first trophy.', 1, 0, 0, 300, 3),
  ('Bronze League', 'Step up your game! Compete against 4 intermediate AI teams.', 2, 900, 100, 600, 4),
  ('Silver Championship', 'A serious challenge! Battle through 4 tough opponents.', 3, 1100, 250, 1200, 4),
  ('Gold Masters', 'Elite competition! Only the best survive 5 rounds against strong AI.', 4, 1300, 500, 2500, 5),
  ('Legendary Cup', 'The ultimate test! 5 rounds of brutal competition for massive rewards.', 5, 1500, 1000, 5000, 5);

-- Add trophy count to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS trophy_count INTEGER DEFAULT 0;

-- Create function to update trophy count
CREATE OR REPLACE FUNCTION update_trophy_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET trophy_count = (
      SELECT COUNT(*) FROM user_trophies WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET trophy_count = (
      SELECT COUNT(*) FROM user_trophies WHERE user_id = OLD.user_id
    )
    WHERE id = OLD.user_id;
  END IF
;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for trophy count
DROP TRIGGER IF EXISTS trigger_update_trophy_count ON user_trophies;
CREATE TRIGGER trigger_update_trophy_count
AFTER INSERT OR DELETE ON user_trophies
FOR EACH ROW
EXECUTE FUNCTION update_trophy_count();

SELECT '✓ Tournaments and trophy system created successfully!' as result;

-- Show all tournaments
SELECT
  name,
  difficulty,
  required_elo,
  entry_fee,
  reward_coins,
  rounds,
  'Available' as status
FROM tournaments
ORDER BY difficulty;
