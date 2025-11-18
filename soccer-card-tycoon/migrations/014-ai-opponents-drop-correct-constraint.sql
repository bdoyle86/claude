-- Final Fix for AI Opponents - Correct Constraint Name
-- This properly removes the profiles_id_fkey constraint

-- Step 1: Drop the specific foreign key constraint
DO $$
BEGIN
  -- Drop the profiles_id_fkey constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_id_fkey'
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
    RAISE NOTICE '✓ Dropped profiles_id_fkey constraint';
  ELSE
    RAISE NOTICE 'Constraint profiles_id_fkey does not exist';
  END IF;
END $$;

-- Step 2: Clean up any existing bot data
DELETE FROM teams WHERE user_id IN (
  SELECT id FROM profiles WHERE username IN (
    'Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars'
  )
);

DELETE FROM profiles WHERE username IN (
  'Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars'
);

-- Step 3: Create AI opponents
DO $$
DECLARE
  bot_user_id UUID;
  gk_id UUID;
  def_id UUID;
  mid_id UUID;
  fwd_id UUID;
  card_count INTEGER;
BEGIN
  -- Check if we have enough cards
  SELECT COUNT(*) INTO card_count FROM cards WHERE position IN ('GK', 'DEF', 'MID', 'FWD');

  IF card_count < 20 THEN
    RAISE EXCEPTION 'Not enough cards in database. Please ensure migration 008 (card positions) has been run and cards have correct positions.';
  END IF;

  -- Bot 1: "Elite Squad" (ELO 1200)
  bot_user_id := gen_random_uuid();

  SELECT id INTO STRICT gk_id FROM cards WHERE position = 'GK' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT def_id FROM cards WHERE position = 'DEF' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT mid_id FROM cards WHERE position = 'MID' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT fwd_id FROM cards WHERE position = 'FWD' ORDER BY RANDOM() LIMIT 1;

  INSERT INTO profiles (id, username, coins, elo_rating, win_streak)
  VALUES (bot_user_id, 'Elite Squad', 5000, 1200, 3);

  INSERT INTO teams (user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation)
  VALUES (bot_user_id, gk_id, def_id, mid_id, fwd_id, '1-2-1');

  -- Bot 2: "The Challengers" (ELO 1000)
  bot_user_id := gen_random_uuid();

  SELECT id INTO STRICT gk_id FROM cards WHERE position = 'GK' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT def_id FROM cards WHERE position = 'DEF' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT mid_id FROM cards WHERE position = 'MID' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT fwd_id FROM cards WHERE position = 'FWD' ORDER BY RANDOM() LIMIT 1;

  INSERT INTO profiles (id, username, coins, elo_rating, win_streak)
  VALUES (bot_user_id, 'The Challengers', 3000, 1000, 1);

  INSERT INTO teams (user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation)
  VALUES (bot_user_id, gk_id, def_id, mid_id, fwd_id, '1-2-1');

  -- Bot 3: "The Wall" (ELO 900 - Defensive)
  bot_user_id := gen_random_uuid();

  SELECT id INTO STRICT gk_id FROM cards WHERE position = 'GK' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT def_id FROM cards WHERE position = 'DEF' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT mid_id FROM cards WHERE position = 'MID' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT fwd_id FROM cards WHERE position = 'FWD' ORDER BY RANDOM() LIMIT 1;

  INSERT INTO profiles (id, username, coins, elo_rating, win_streak)
  VALUES (bot_user_id, 'The Wall', 2500, 900, 0);

  INSERT INTO teams (user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation)
  VALUES (bot_user_id, gk_id, def_id, mid_id, fwd_id, '2-1-1');

  -- Bot 4: "Goal Machines" (ELO 1100 - Offensive)
  bot_user_id := gen_random_uuid();

  SELECT id INTO STRICT gk_id FROM cards WHERE position = 'GK' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT def_id FROM cards WHERE position = 'DEF' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT mid_id FROM cards WHERE position = 'MID' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT fwd_id FROM cards WHERE position = 'FWD' ORDER BY RANDOM() LIMIT 1;

  INSERT INTO profiles (id, username, coins, elo_rating, win_streak)
  VALUES (bot_user_id, 'Goal Machines', 4000, 1100, 2);

  INSERT INTO teams (user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation)
  VALUES (bot_user_id, gk_id, def_id, mid_id, fwd_id, '1-1-2');

  -- Bot 5: "Rising Stars" (ELO 800 - Beginner)
  bot_user_id := gen_random_uuid();

  SELECT id INTO STRICT gk_id FROM cards WHERE position = 'GK' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT def_id FROM cards WHERE position = 'DEF' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT mid_id FROM cards WHERE position = 'MID' ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO STRICT fwd_id FROM cards WHERE position = 'FWD' ORDER BY RANDOM() LIMIT 1;

  INSERT INTO profiles (id, username, coins, elo_rating, win_streak)
  VALUES (bot_user_id, 'Rising Stars', 1500, 800, 0);

  INSERT INTO teams (user_id, goalkeeper_id, defender_id, midfielder_id, forward_id, formation)
  VALUES (bot_user_id, gk_id, def_id, mid_id, fwd_id, '1-2-1');

  RAISE NOTICE '✓ Successfully created 5 AI opponent teams!';
END $$;

-- Step 4: Verify creation
SELECT
  '✓ AI Opponents Created Successfully!' as status,
  COUNT(*) as bot_teams_created
FROM profiles
WHERE username IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars');

-- Show the bot teams
SELECT
  p.username as "Bot Name",
  p.elo_rating as "ELO Rating",
  t.formation as "Formation",
  CASE
    WHEN t.goalkeeper_id IS NOT NULL AND t.defender_id IS NOT NULL
         AND t.midfielder_id IS NOT NULL AND t.forward_id IS NOT NULL
    THEN '✓ Complete'
    ELSE '✗ Incomplete'
  END as "Team Status"
FROM profiles p
JOIN teams t ON p.id = t.user_id
WHERE p.username IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars')
ORDER BY p.elo_rating DESC;
