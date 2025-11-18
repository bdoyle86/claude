-- Add is_bot flag to profiles table for better AI opponent management

-- Add is_bot column (defaults to false for existing users)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;

-- Mark existing AI opponents as bots
UPDATE profiles
SET is_bot = true
WHERE username IN ('Elite Squad', 'The Challengers', 'The Wall', 'Goal Machines', 'Rising Stars');

-- Create index for faster bot filtering
CREATE INDEX IF NOT EXISTS idx_profiles_is_bot ON profiles(is_bot);

-- Verify the change
SELECT
  '✓ Bot Flag Added' as status,
  COUNT(*) FILTER (WHERE is_bot = true) as bot_count,
  COUNT(*) FILTER (WHERE is_bot = false) as human_count
FROM profiles;

-- Show all bots
SELECT
  username,
  elo_rating,
  coins,
  'AI Opponent' as type
FROM profiles
WHERE is_bot = true
ORDER BY elo_rating DESC;

-- Example: Query for human players only (for leaderboards)
SELECT
  username,
  elo_rating,
  coins,
  ranked_wins,
  ranked_losses
FROM profiles
WHERE is_bot = false
ORDER BY elo_rating DESC
LIMIT 10;

SELECT '✓ AI opponents now flagged - can filter from leaderboards easily' as result;
