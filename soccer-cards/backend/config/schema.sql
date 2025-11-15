-- Drop tables if they exist (for development)
DROP TABLE IF EXISTS user_cards CASCADE;
DROP TABLE IF EXISTS store_cards CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS packs CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  coins INTEGER DEFAULT 1500,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cards table
CREATE TABLE cards (
  id SERIAL PRIMARY KEY,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_cards junction table
CREATE TABLE user_cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, card_id)
);

-- Create packs table
CREATE TABLE packs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  card_count INTEGER DEFAULT 5,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create store_cards table (for single card store)
CREATE TABLE store_cards (
  id SERIAL PRIMARY KEY,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT -1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(card_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_user_cards_card_id ON user_cards(card_id);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_store_cards_card_id ON store_cards(card_id);

-- Insert default pack
INSERT INTO packs (name, description, price, card_count, image_url) VALUES
('Standard Pack', 'Contains 5 player cards, with a chance for a rare!', 100, 5, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdvKhecrWffpCB5AfX6J4ZUMRFEJH2roN8uOLeN9kkjTPbwNru2wf8H8HclVTfB4QSx4NK17nUgvmRE3Qqb3jMowjkUp9y4nI6HM5HWoINbTdDOxY47pnLq7MSKceaNmLmh8DWXUO1YymYzHQvTgl1W_drgkdu_8fuzx7iF0-ZFwJ2h2mtYh9-b19x8MBRTib6I923xnhWyAFavLnIl9s-ccRJYg_cYwnsbYOhPeU79-obHttZWClqg0bjCyKn2SCCQROkf7ZA');
