-- Create AI Opponent Teams for Testing and Solo Play
-- This adds bot teams that players can battle against

-- First, create a system user for AI opponents (if it doesn't exist)
-- Note: We'll use a special user_id that we know exists or create placeholder profiles

-- Create AI opponent profiles with teams
DO $$
DECLARE
  bot_user_id UUID;
  team_id UUID;
  gk_id UUID;
  def_id UUID;
  mid_id UUID;
  fwd_id UUID;
BEGIN
  -- Bot 1: "Pro Team"
  -- Get random cards for each position
  SELECT id INTO gk_id FROM cards WHERE position = 'GK' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO def_id FROM cards WHERE position = 'DEF' AND rarity = 'Rare' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO mid_id FROM cards WHERE position = 'MID' AND rarity = 'Rare' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO fwd_id FROM cards WHERE position = 'FWD' AND rarity = 'Epic' ORDER BY RANDOM() LIMIT 1;

  -- Insert into teams with a generated UUID for bot user
  bot_user_id := gen_random_uuid();

  INSERT INTO teams (id, user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    bot_user_id,
    gk_id,
    def_id,
    mid_id,
    fwd_id,
    '1-2-1',
    NOW(),
    NOW()
  );

  -- Insert corresponding profile
  INSERT INTO profiles (id, username, coins, elo_rating, win_streak)
  VALUES (
    bot_user_id,
    'Elite Squad',
    1000,
    1200,
    0
  );

  -- Bot 2: "Balanced Team"
  SELECT id INTO gk_id FROM cards WHERE position = 'GK' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO def_id FROM cards WHERE position = 'DEF' AND rarity = 'Common' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO mid_id FROM cards WHERE position = 'MID' AND rarity = 'Rare' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO fwd_id FROM cards WHERE position = 'FWD' AND rarity = 'Rare' ORDER BY RANDOM() LIMIT 1;

  bot_user_id := gen_random_uuid();

  INSERT INTO teams (id, user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    bot_user_id,
    gk_id,
    def_id,
    mid_id,
    fwd_id,
    '1-2-1',
    NOW(),
    NOW()
  );

  INSERT INTO profiles (id, username, coins, elo_rating, win_streak)
  VALUES (
    bot_user_id,
    'The Challengers',
    1000,
    1000,
    0
  );

  -- Bot 3: "Defensive Team"
  SELECT id INTO gk_id FROM cards WHERE position = 'GK' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO def_id FROM cards WHERE position = 'DEF' AND rarity = 'Rare' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO mid_id FROM cards WHERE position = 'MID' AND rarity = 'Common' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO fwd_id FROM cards WHERE position = 'FWD' AND rarity = 'Common' ORDER BY RANDOM() LIMIT 1;

  bot_user_id := gen_random_uuid();

  INSERT INTO teams (id, user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    bot_user_id,
    gk_id,
    def_id,
    mid_id,
    fwd_id,
    '2-1-1',
    NOW(),
    NOW()
  );

  INSERT INTO profiles (id, username, coins, elo_rating, win_streak)
  VALUES (
    bot_user_id,
    'The Wall',
    1000,
    900,
    0
  );

  -- Bot 4: "Attacking Team"
  SELECT id INTO gk_id FROM cards WHERE position = 'GK' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO def_id FROM cards WHERE position = 'DEF' AND rarity = 'Common' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO mid_id FROM cards WHERE position = 'MID' AND rarity = 'Common' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO fwd_id FROM cards WHERE position = 'FWD' AND rarity = 'Epic' ORDER BY RANDOM() LIMIT 1;

  bot_user_id := gen_random_uuid();

  INSERT INTO teams (id, user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    bot_user_id,
    gk_id,
    def_id,
    mid_id,
    fwd_id,
    '1-1-2',
    NOW(),
    NOW()
  );

  INSERT INTO profiles (id, username, coins, elo_rating, win_streak)
  VALUES (
    bot_user_id,
    'Goal Machines',
    1000,
    1100,
    0
  );

  -- Bot 5: "Rookie Team"
  SELECT id INTO gk_id FROM cards WHERE position = 'GK' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO def_id FROM cards WHERE position = 'DEF' AND rarity = 'Common' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO mid_id FROM cards WHERE position = 'MID' AND rarity = 'Common' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO fwd_id FROM cards WHERE position = 'FWD' AND rarity = 'Common' ORDER BY RANDOM() LIMIT 1;

  bot_user_id := gen_random_uuid();

  INSERT INTO teams (id, user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    bot_user_id,
    gk_id,
    def_id,
    mid_id,
    fwd_id,
    '1-2-1',
    NOW(),
    NOW()
  );

  INSERT INTO profiles (id, username, coins, elo_rating, win_streak)
  VALUES (
    bot_user_id,
    'Rising Stars',
    1000,
    800,
    0
  );

END $$;

-- Verify bot teams were created
SELECT p.username, t.formation, p.elo_rating
FROM teams t
JOIN profiles p ON t.user_id = p.id
ORDER BY p.elo_rating DESC;
