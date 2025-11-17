-- Update Card Positions to Match Team Requirements
-- Converts detailed positions to simplified 4-position system

-- Update all forwards (ST, LW, RW, CF) to FWD
UPDATE cards
SET position = 'FWD'
WHERE position IN ('ST', 'LW', 'RW', 'CF', 'LF', 'RF');

-- Update all midfielders (CM, CDM, CAM, LM, RM) to MID
UPDATE cards
SET position = 'MID'
WHERE position IN ('CM', 'CDM', 'CAM', 'LM', 'RM');

-- Update all defenders (CB, LB, RB, LWB, RWB) to DEF
UPDATE cards
SET position = 'DEF'
WHERE position IN ('CB', 'LB', 'RB', 'LWB', 'RWB');

-- GK stays as GK (already correct)
-- No update needed for GK

-- Verify the changes
SELECT position, COUNT(*) as count
FROM cards
GROUP BY position
ORDER BY position;
