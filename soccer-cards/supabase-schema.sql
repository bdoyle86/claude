-- ============================================
-- SOCCER CARD TRADING GAME - SUPABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Cards table (stores all available soccer player cards)
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_name VARCHAR(100) NOT NULL,
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('Common', 'Rare', 'Epic')),
  club VARCHAR(100),
  country VARCHAR(100),
  position VARCHAR(20),
  image_url TEXT,
  overall_rating INTEGER,
  pace INTEGER,
  shooting INTEGER,
  passing INTEGER,
  dribbling INTEGER,
  defending INTEGER,
  physical INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User cards (junction table - which cards each user owns)
CREATE TABLE IF NOT EXISTS user_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, card_id)
);

-- User profiles (extends Supabase auth.users with game data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  coins INTEGER DEFAULT 1500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Packs table (defines available pack types)
CREATE TABLE IF NOT EXISTS packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  card_count INTEGER DEFAULT 5,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Store cards (cards available for direct purchase)
CREATE TABLE IF NOT EXISTS store_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID UNIQUE NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT -1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_id ON user_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
CREATE INDEX IF NOT EXISTS idx_store_cards_card_id ON store_cards(card_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_cards ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- User cards policies
CREATE POLICY "Users can view their own cards"
  ON user_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cards"
  ON user_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
  ON user_cards FOR UPDATE
  USING (auth.uid() = user_id);

-- Cards policies (read-only for all authenticated users)
CREATE POLICY "Anyone can view cards"
  ON cards FOR SELECT
  TO authenticated
  USING (true);

-- Packs policies (read-only for all authenticated users)
CREATE POLICY "Anyone can view packs"
  ON packs FOR SELECT
  TO authenticated
  USING (true);

-- Store cards policies (read-only for all authenticated users)
CREATE POLICY "Anyone can view store cards"
  ON store_cards FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, coins)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    1500
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- INSERT DEFAULT PACK
-- ============================================

INSERT INTO packs (name, description, price, card_count, image_url)
VALUES (
  'Standard Pack',
  'Contains 5 player cards, with a chance for a rare!',
  100,
  5,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCdvKhecrWffpCB5AfX6J4ZUMRFEJH2roN8uOLeN9kkjTPbwNru2wf8H8HclVTfB4QSx4NK17nUgvmRE3Qqb3jMowjkUp9y4nI6HM5HWoINbTdDOxY47pnLq7MSKceaNmLmh8DWXUO1YymYzHQvTgl1W_drgkdu_8fuzx7iF0-ZFwJ2h2mtYh9-b19x8MBRTib6I923xnhWyAFavLnIl9s-ccRJYg_cYwnsbYOhPeU79-obHttZWClqg0bjCyKn2SCCQROkf7ZA'
)
ON CONFLICT DO NOTHING;
