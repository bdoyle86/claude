-- Populate the store_cards table with featured cards
-- These cards can be purchased directly from the Card Store
-- Stock of -1 means unlimited availability

-- First, let's add some Epic cards (highest tier) at premium prices
INSERT INTO store_cards (card_id, price, stock)
SELECT id, 500, -1
FROM cards
WHERE player_name IN ('Lionel Messi', 'Cristiano Ronaldo', 'Kevin De Bruyne');

-- Add some Rare cards at mid-tier prices
INSERT INTO store_cards (card_id, price, stock)
SELECT id, 300, -1
FROM cards
WHERE player_name IN ('Kylian Mbappé', 'Erling Haaland', 'Mohamed Salah', 'Neymar Jr', 'Robert Lewandowski');

-- Add some Common cards at budget prices
INSERT INTO store_cards (card_id, price, stock)
SELECT id, 150, -1
FROM cards
WHERE player_name IN ('Bruno Fernandes', 'Son Heung-min', 'Raheem Sterling')
LIMIT 3;

-- Verify the store has been populated
SELECT
  sc.id,
  c.player_name,
  c.rarity,
  sc.price,
  sc.stock
FROM store_cards sc
JOIN cards c ON sc.card_id = c.id
ORDER BY
  CASE c.rarity
    WHEN 'Epic' THEN 1
    WHEN 'Rare' THEN 2
    WHEN 'Common' THEN 3
  END,
  c.player_name;
