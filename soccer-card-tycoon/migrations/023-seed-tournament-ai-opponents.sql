-- Seed AI opponents for tournament matches
-- These AI opponents have different difficulty levels matching tournament tiers

-- First, let's check if we have any AI users already
DO $$
DECLARE
  ai_user_id UUID;
  team_id UUID;
  gk_id UUID;
  def_id UUID;
  mid_id UUID;
  fwd_id UUID;
BEGIN
  -- Helper function to get random card by position and approximate rating
  CREATE TEMP TABLE IF NOT EXISTS temp_cards AS
  SELECT * FROM cards;

  -- Create Rookie AI (Easy - 1000 ELO, weak cards)
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('ai_rookie_striker@bot.local', crypt('no-login', gen_salt('bf')), now(), now(), now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO ai_user_id;

  IF ai_user_id IS NULL THEN
    SELECT id INTO ai_user_id FROM auth.users WHERE email = 'ai_rookie_striker@bot.local';
  END IF;

  INSERT INTO profiles (id, username, coins, elo_rating, is_bot, created_at)
  VALUES (ai_user_id, 'Rookie Striker', 1000, 900, true, now())
  ON CONFLICT (id) DO UPDATE SET is_bot = true, elo_rating = 900;

  -- Create team for Rookie AI (common/low-rated cards)
  SELECT id INTO gk_id FROM cards WHERE position = 'GK' AND rarity = 'Common' ORDER BY overall_rating LIMIT 1;
  SELECT id INTO def_id FROM cards WHERE position = 'DEF' AND rarity = 'Common' ORDER BY overall_rating LIMIT 1;
  SELECT id INTO mid_id FROM cards WHERE position = 'MID' AND rarity = 'Common' ORDER BY overall_rating LIMIT 1;
  SELECT id INTO fwd_id FROM cards WHERE position = 'FWD' AND rarity = 'Common' ORDER BY overall_rating LIMIT 1;

  INSERT INTO teams (user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation)
  VALUES (ai_user_id, gk_id, def_id, mid_id, fwd_id, '1-2-1')
  ON CONFLICT DO NOTHING;

  -- Add cards to AI inventory
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, gk_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, def_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, mid_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, fwd_id, 1) ON CONFLICT DO NOTHING;


  -- Create Bronze AI (Medium - 1000 ELO, mixed cards)
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('ai_bronze_warriors@bot.local', crypt('no-login', gen_salt('bf')), now(), now(), now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO ai_user_id;

  IF ai_user_id IS NULL THEN
    SELECT id INTO ai_user_id FROM auth.users WHERE email = 'ai_bronze_warriors@bot.local';
  END IF;

  INSERT INTO profiles (id, username, coins, elo_rating, is_bot, created_at)
  VALUES (ai_user_id, 'Bronze Warriors', 1500, 1000, true, now())
  ON CONFLICT (id) DO UPDATE SET is_bot = true, elo_rating = 1000;

  SELECT id INTO gk_id FROM cards WHERE position = 'GK' AND rarity IN ('Common', 'Rare') ORDER BY overall_rating DESC LIMIT 1 OFFSET 2;
  SELECT id INTO def_id FROM cards WHERE position = 'DEF' AND rarity IN ('Common', 'Rare') ORDER BY overall_rating DESC LIMIT 1 OFFSET 2;
  SELECT id INTO mid_id FROM cards WHERE position = 'MID' AND rarity IN ('Common', 'Rare') ORDER BY overall_rating DESC LIMIT 1 OFFSET 2;
  SELECT id INTO fwd_id FROM cards WHERE position = 'FWD' AND rarity IN ('Common', 'Rare') ORDER BY overall_rating DESC LIMIT 1 OFFSET 2;

  INSERT INTO teams (user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation)
  VALUES (ai_user_id, gk_id, def_id, mid_id, fwd_id, '1-2-1')
  ON CONFLICT DO NOTHING;

  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, gk_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, def_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, mid_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, fwd_id, 1) ON CONFLICT DO NOTHING;


  -- Create Silver AI (Hard - 1200 ELO, good cards)
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('ai_silver_legends@bot.local', crypt('no-login', gen_salt('bf')), now(), now(), now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO ai_user_id;

  IF ai_user_id IS NULL THEN
    SELECT id INTO ai_user_id FROM auth.users WHERE email = 'ai_silver_legends@bot.local';
  END IF;

  INSERT INTO profiles (id, username, coins, elo_rating, is_bot, created_at)
  VALUES (ai_user_id, 'Silver Legends', 2000, 1200, true, now())
  ON CONFLICT (id) DO UPDATE SET is_bot = true, elo_rating = 1200;

  SELECT id INTO gk_id FROM cards WHERE position = 'GK' AND rarity IN ('Rare', 'Epic') ORDER BY overall_rating DESC LIMIT 1 OFFSET 1;
  SELECT id INTO def_id FROM cards WHERE position = 'DEF' AND rarity IN ('Rare', 'Epic') ORDER BY overall_rating DESC LIMIT 1 OFFSET 1;
  SELECT id INTO mid_id FROM cards WHERE position = 'MID' AND rarity IN ('Rare', 'Epic') ORDER BY overall_rating DESC LIMIT 1 OFFSET 1;
  SELECT id INTO fwd_id FROM cards WHERE position = 'FWD' AND rarity IN ('Rare', 'Epic') ORDER BY overall_rating DESC LIMIT 1 OFFSET 1;

  INSERT INTO teams (user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation)
  VALUES (ai_user_id, gk_id, def_id, mid_id, fwd_id, '1-1-2')
  ON CONFLICT DO NOTHING;

  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, gk_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, def_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, mid_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, fwd_id, 1) ON CONFLICT DO NOTHING;


  -- Create Gold AI (Very Hard - 1400 ELO, top cards)
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('ai_gold_champions@bot.local', crypt('no-login', gen_salt('bf')), now(), now(), now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO ai_user_id;

  IF ai_user_id IS NULL THEN
    SELECT id INTO ai_user_id FROM auth.users WHERE email = 'ai_gold_champions@bot.local';
  END IF;

  INSERT INTO profiles (id, username, coins, elo_rating, is_bot, created_at)
  VALUES (ai_user_id, 'Gold Champions', 3000, 1400, true, now())
  ON CONFLICT (id) DO UPDATE SET is_bot = true, elo_rating = 1400;

  SELECT id INTO gk_id FROM cards WHERE position = 'GK' ORDER BY overall_rating DESC LIMIT 1;
  SELECT id INTO def_id FROM cards WHERE position = 'DEF' ORDER BY overall_rating DESC LIMIT 1;
  SELECT id INTO mid_id FROM cards WHERE position = 'MID' ORDER BY overall_rating DESC LIMIT 1;
  SELECT id INTO fwd_id FROM cards WHERE position = 'FWD' ORDER BY overall_rating DESC LIMIT 1;

  INSERT INTO teams (user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation)
  VALUES (ai_user_id, gk_id, def_id, mid_id, fwd_id, '1-1-2')
  ON CONFLICT DO NOTHING;

  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, gk_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, def_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, mid_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, fwd_id, 1) ON CONFLICT DO NOTHING;


  -- Create Legendary AI (Expert - 1600 ELO, best possible cards)
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('ai_legendary_titans@bot.local', crypt('no-login', gen_salt('bf')), now(), now(), now())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO ai_user_id;

  IF ai_user_id IS NULL THEN
    SELECT id INTO ai_user_id FROM auth.users WHERE email = 'ai_legendary_titans@bot.local';
  END IF;

  INSERT INTO profiles (id, username, coins, elo_rating, is_bot, created_at)
  VALUES (ai_user_id, 'Legendary Titans', 5000, 1600, true, now())
  ON CONFLICT (id) DO UPDATE SET is_bot = true, elo_rating = 1600;

  SELECT id INTO gk_id FROM cards WHERE position = 'GK' AND rarity = 'Epic' ORDER BY overall_rating DESC LIMIT 1;
  SELECT id INTO def_id FROM cards WHERE position = 'DEF' AND rarity = 'Epic' ORDER BY overall_rating DESC LIMIT 1;
  SELECT id INTO mid_id FROM cards WHERE position = 'MID' AND rarity = 'Epic' ORDER BY overall_rating DESC LIMIT 1;
  SELECT id INTO fwd_id FROM cards WHERE position = 'FWD' AND rarity = 'Epic' ORDER BY overall_rating DESC LIMIT 1;

  INSERT INTO teams (user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation)
  VALUES (ai_user_id, gk_id, def_id, mid_id, fwd_id, '2-1-1')
  ON CONFLICT DO NOTHING;

  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, gk_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, def_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, mid_id, 1) ON CONFLICT DO NOTHING;
  INSERT INTO user_cards (user_id, card_id, quantity) VALUES (ai_user_id, fwd_id, 1) ON CONFLICT DO NOTHING;

  DROP TABLE IF EXISTS temp_cards;
END $$;

-- Show all AI opponents
SELECT
  username,
  elo_rating,
  coins,
  'AI Opponent' as type
FROM profiles
WHERE is_bot = true
ORDER BY elo_rating;

SELECT '✓ AI opponents created for tournament matches!' as result;
