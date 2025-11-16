-- Insert pack data into the packs table
-- These packs will be available for purchase in the Pack Store

INSERT INTO packs (name, description, price, card_count, image_url) VALUES
(
  'Starter Pack',
  'Perfect for beginners! Get 5 random cards to start your collection.',
  100,
  5,
  'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aae?w=400&h=600&fit=crop'
),
(
  'Premium Pack',
  'Higher chances of rare cards! Open 5 cards with boosted drop rates.',
  250,
  5,
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=600&fit=crop'
),
(
  'Mega Pack',
  'Go big! Get 10 cards with increased Epic drop rates.',
  450,
  10,
  'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=600&fit=crop'
);

-- Verify insertion
SELECT * FROM packs ORDER BY price;
