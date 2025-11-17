-- Fix Evolution and Battle Issues
-- 1. Add missing updated_at column to user_cards
-- 2. Verify AI opponents exist

-- Step 1: Add updated_at column to user_cards if it doesn't exist
ALTER TABLE user_cards
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_user_cards_updated_at ON user_cards;
CREATE TRIGGER update_user_cards_updated_at
    BEFORE UPDATE ON user_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 3: Verify tables and check for AI opponents
DO $$
DECLARE
    opponent_count INTEGER;
    team_count INTEGER;
BEGIN
    -- Count existing teams
    SELECT COUNT(*) INTO team_count FROM teams;
    RAISE NOTICE 'Total teams in database: %', team_count;

    -- Count teams that could be opponents (has all 4 positions filled)
    SELECT COUNT(*) INTO opponent_count
    FROM teams
    WHERE goalkeeper_id IS NOT NULL
      AND defender_id IS NOT NULL
      AND midfielder_id IS NOT NULL
      AND forward_id IS NOT NULL;

    RAISE NOTICE 'Complete teams available for battles: %', opponent_count;

    IF opponent_count < 2 THEN
        RAISE NOTICE 'Warning: Not enough complete teams for battles. Run migration 009 to add AI opponents.';
    END IF;
END $$;

-- Verify the fix
SELECT
    'Evolution fix applied - updated_at column added' as status,
    COUNT(*) as total_teams,
    COUNT(*) FILTER (WHERE goalkeeper_id IS NOT NULL AND defender_id IS NOT NULL
                     AND midfielder_id IS NOT NULL AND forward_id IS NOT NULL) as complete_teams
FROM teams;
