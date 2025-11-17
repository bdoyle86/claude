-- Achievements System

-- Achievements master table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'battle', 'collection', 'pack', 'rarity', 'coins'
  icon TEXT NOT NULL, -- material icon name
  requirement_type TEXT NOT NULL, -- 'count', 'value', 'specific'
  requirement_value INTEGER NOT NULL,
  reward_coins INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (read-only for all users)
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- Insert default achievements
INSERT INTO achievements (name, title, description, category, icon, requirement_type, requirement_value, reward_coins, rarity) VALUES
  -- Battle Achievements
  ('first_victory', 'First Blood', 'Win your first battle', 'battle', 'emoji_events', 'count', 1, 50, 'common'),
  ('battle_warrior', 'Battle Warrior', 'Win 10 battles', 'battle', 'military_tech', 'count', 10, 200, 'rare'),
  ('battle_legend', 'Battle Legend', 'Win 50 battles', 'battle', 'shield_person', 'count', 50, 1000, 'epic'),
  ('battle_god', 'Battle God', 'Win 100 battles', 'battle', 'workspace_premium', 'count', 100, 2500, 'legendary'),
  ('undefeated', 'Undefeated', 'Win 5 battles in a row', 'battle', 'verified', 'count', 5, 500, 'epic'),

  -- Collection Achievements
  ('first_card', 'First Card', 'Collect your first card', 'collection', 'style', 'count', 1, 25, 'common'),
  ('card_collector', 'Card Collector', 'Collect 25 cards', 'collection', 'collections', 'count', 25, 150, 'common'),
  ('card_master', 'Card Master', 'Collect 50 cards', 'collection', 'collections_bookmark', 'count', 50, 300, 'rare'),
  ('card_hoarder', 'Card Hoarder', 'Collect 100 cards', 'collection', 'inventory', 'count', 100, 750, 'epic'),
  ('ultimate_collector', 'Ultimate Collector', 'Collect 200 cards', 'collection', 'auto_awesome', 'count', 200, 2000, 'legendary'),

  -- Rarity Achievements
  ('first_rare', 'Rare Find', 'Collect your first Rare card', 'rarity', 'star', 'count', 1, 50, 'common'),
  ('rare_collector', 'Rare Collector', 'Collect 10 Rare cards', 'rarity', 'star_half', 'count', 10, 200, 'rare'),
  ('first_epic', 'Epic Discovery', 'Collect your first Epic card', 'rarity', 'stars', 'count', 1, 100, 'rare'),
  ('epic_collector', 'Epic Collector', 'Collect 5 Epic cards', 'rarity', 'kid_star', 'count', 5, 500, 'epic'),
  ('legendary_collector', 'Legendary Collector', 'Collect 10 Epic cards', 'rarity', 'diamond', 'count', 10, 1500, 'legendary'),

  -- Pack Achievements
  ('pack_opener', 'Pack Opener', 'Open your first pack', 'pack', 'redeem', 'count', 1, 25, 'common'),
  ('pack_addict', 'Pack Addict', 'Open 10 packs', 'pack', 'card_giftcard', 'count', 10, 150, 'rare'),
  ('pack_master', 'Pack Master', 'Open 50 packs', 'pack', 'loyalty', 'count', 50, 500, 'epic'),

  -- Coins Achievements
  ('first_coins', 'Coin Earner', 'Earn 500 coins total', 'coins', 'paid', 'value', 500, 50, 'common'),
  ('coin_collector', 'Coin Collector', 'Earn 2000 coins total', 'coins', 'savings', 'value', 2000, 200, 'rare'),
  ('coin_magnate', 'Coin Magnate', 'Earn 10000 coins total', 'coins', 'account_balance', 'value', 10000, 1000, 'epic'),
  ('coin_tycoon', 'Coin Tycoon', 'Earn 50000 coins total', 'coins', 'attach_money', 'value', 50000, 5000, 'legendary')
ON CONFLICT (name) DO NOTHING;
