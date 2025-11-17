-- Soccer Card Tycoon - Seed Data
-- Run this script in your Supabase SQL Editor to populate the database

-- Insert Sample Cards
-- Positions: GK (Goalkeeper), DEF (Defender), MID (Midfielder), FWD (Forward)
INSERT INTO public.cards (player_name, rarity, club, country, position, overall_rating, pace, shooting, passing, dribbling, defending, physical, image_url) VALUES
('Lionel Messi', 'Epic', 'Inter Miami CF', 'Argentina', 'FWD', 94, 85, 92, 91, 95, 38, 65, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400'),
('Cristiano Ronaldo', 'Epic', 'Al Nassr', 'Portugal', 'FWD', 91, 84, 93, 82, 88, 35, 77, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400'),
('Kylian Mbappé', 'Epic', 'Real Madrid', 'France', 'FWD', 95, 97, 89, 80, 92, 36, 76, 'https://images.unsplash.com/photo-1571268373243-e4612e5f9f3c?w=400'),
('Erling Haaland', 'Rare', 'Manchester City', 'Norway', 'FWD', 91, 89, 91, 65, 80, 45, 88, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400'),
('Kevin De Bruyne', 'Rare', 'Manchester City', 'Belgium', 'MID', 91, 76, 86, 93, 87, 61, 78, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400'),
('Neymar Jr', 'Rare', 'Al Hilal', 'Brazil', 'FWD', 89, 87, 83, 86, 94, 37, 61, 'https://images.unsplash.com/photo-1571268373243-e4612e5f9f3c?w=400'),
('Mohamed Salah', 'Rare', 'Liverpool', 'Egypt', 'FWD', 89, 90, 87, 81, 90, 45, 75, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400'),
('Virgil van Dijk', 'Rare', 'Liverpool', 'Netherlands', 'DEF', 90, 75, 60, 70, 72, 91, 86, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400'),
('Luka Modrić', 'Rare', 'Real Madrid', 'Croatia', 'MID', 88, 74, 76, 89, 90, 72, 65, 'https://images.unsplash.com/photo-1571268373243-e4612e5f9f3c?w=400'),
('Robert Lewandowski', 'Rare', 'Barcelona', 'Poland', 'FWD', 91, 78, 92, 79, 86, 44, 82, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400'),
('Vinícius Jr', 'Common', 'Real Madrid', 'Brazil', 'FWD', 86, 95, 83, 79, 90, 29, 61, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400'),
('Jude Bellingham', 'Common', 'Real Madrid', 'England', 'MID', 87, 80, 82, 86, 85, 78, 84, 'https://images.unsplash.com/photo-1571268373243-e4612e5f9f3c?w=400'),
('Harry Kane', 'Common', 'Bayern Munich', 'England', 'FWD', 90, 70, 91, 83, 82, 47, 82, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400'),
('Bukayo Saka', 'Common', 'Arsenal', 'England', 'FWD', 84, 86, 78, 81, 85, 42, 70, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400'),
('Phil Foden', 'Common', 'Manchester City', 'England', 'FWD', 85, 85, 80, 88, 89, 45, 70, 'https://images.unsplash.com/photo-1571268373243-e4612e5f9f3c?w=400'),
('Rodri', 'Common', 'Manchester City', 'Spain', 'MID', 89, 61, 72, 87, 82, 87, 81, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400'),
('Bruno Fernandes', 'Common', 'Manchester United', 'Portugal', 'MID', 86, 75, 85, 89, 87, 68, 77, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400'),
('Son Heung-min', 'Common', 'Tottenham', 'South Korea', 'FWD', 87, 88, 89, 82, 86, 42, 68, 'https://images.unsplash.com/photo-1571268373243-e4612e5f9f3c?w=400'),
('Thibaut Courtois', 'Common', 'Real Madrid', 'Belgium', 'GK', 90, 46, 11, 75, 16, 88, 78, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400'),
('Alisson Becker', 'Common', 'Liverpool', 'Brazil', 'GK', 89, 51, 13, 84, 17, 86, 81, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400'),
('Ederson', 'Common', 'Manchester City', 'Brazil', 'GK', 89, 56, 17, 93, 18, 88, 78, 'https://images.unsplash.com/photo-1571268373243-e4612e5f9f3c?w=400'),
('Marquinhos', 'Common', 'PSG', 'Brazil', 'DEF', 87, 79, 55, 73, 75, 87, 78, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400'),
('Rúben Dias', 'Common', 'Manchester City', 'Portugal', 'DEF', 88, 65, 50, 71, 70, 88, 83, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400'),
('João Cancelo', 'Common', 'Al Hilal', 'Portugal', 'DEF', 84, 85, 71, 85, 87, 65, 75, 'https://images.unsplash.com/photo-1571268373243-e4612e5f9f3c?w=400'),
('Trent Alexander-Arnold', 'Common', 'Liverpool', 'England', 'DEF', 87, 76, 66, 92, 82, 78, 71, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400'),
('Joshua Kimmich', 'Common', 'Bayern Munich', 'Germany', 'MID', 88, 70, 73, 88, 84, 84, 79, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400'),
('Casemiro', 'Common', 'Manchester United', 'Brazil', 'MID', 86, 62, 66, 75, 72, 88, 90, 'https://images.unsplash.com/photo-1571268373243-e4612e5f9f3c?w=400'),
('Federico Valverde', 'Common', 'Real Madrid', 'Uruguay', 'MID', 87, 84, 82, 83, 83, 84, 87, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400'),
('Bernardo Silva', 'Common', 'Manchester City', 'Portugal', 'MID', 88, 79, 74, 88, 91, 55, 68, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400'),
('Martin Ødegaard', 'Common', 'Arsenal', 'Norway', 'MID', 86, 77, 82, 89, 88, 58, 71, 'https://images.unsplash.com/photo-1571268373243-e4612e5f9f3c?w=400');

-- Insert Sample Packs
INSERT INTO public.packs (name, description, price, card_count, image_url) VALUES
('Standard Pack', 'Contains 5 player cards with a chance for rare players!', 100, 5, 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'),
('Premium Pack', 'Contains 5 player cards with increased odds for Epic cards!', 200, 5, 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800');

-- Insert Sample Store Cards
-- First, let's add some specific cards to the store
-- We'll select a few cards and add them to the store
INSERT INTO public.store_cards (card_id, price, stock)
SELECT id,
  CASE
    WHEN rarity = 'Epic' THEN 500
    WHEN rarity = 'Rare' THEN 300
    ELSE 150
  END as price,
  -1 as stock
FROM public.cards
WHERE player_name IN ('Cristiano Ronaldo', 'Lionel Messi', 'Neymar Jr', 'Mohamed Salah', 'Harry Kane', 'Bukayo Saka')
LIMIT 6;

-- Success message
SELECT 'Seed data inserted successfully! You now have 30 cards, 2 pack types, and 6 cards in the store.' as message;
