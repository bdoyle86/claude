-- Battle System Tables (FIXED - Using correct data types)

-- Teams table: stores user's active team composition
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Team',
  card_1_id UUID REFERENCES cards(id),
  card_2_id UUID REFERENCES cards(id),
  card_3_id UUID REFERENCES cards(id),
  card_4_id UUID REFERENCES cards(id),
  card_5_id UUID REFERENCES cards(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Battles table: stores battle history and results
CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player1_team_id UUID REFERENCES teams(id),
  player2_team_id UUID REFERENCES teams(id),
  winner_id UUID REFERENCES auth.users(id),
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  rewards INTEGER NOT NULL DEFAULT 0,
  battle_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battle stats view for leaderboard
CREATE OR REPLACE VIEW battle_stats AS
SELECT
  u.id as user_id,
  p.username,
  COUNT(b.id) as total_battles,
  COUNT(CASE WHEN b.winner_id = u.id THEN 1 END) as wins,
  COUNT(CASE WHEN b.winner_id != u.id AND (b.player1_id = u.id OR b.player2_id = u.id) THEN 1 END) as losses,
  COALESCE(SUM(CASE WHEN b.winner_id = u.id THEN b.rewards ELSE 0 END), 0) as total_rewards
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN battles b ON b.player1_id = u.id OR b.player2_id = u.id
GROUP BY u.id, p.username;

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Users can view all teams"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own team"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team"
  ON teams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team"
  ON teams FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for battles
CREATE POLICY "Users can view battles they participated in"
  ON battles FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can insert battles they participate in"
  ON battles FOR INSERT
  WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);
CREATE INDEX IF NOT EXISTS idx_battles_player1_id ON battles(player1_id);
CREATE INDEX IF NOT EXISTS idx_battles_player2_id ON battles(player2_id);
CREATE INDEX IF NOT EXISTS idx_battles_created_at ON battles(created_at DESC);
