-- ===== SESSION SUPPORT =====
-- Add session column to fee_deposits so payments can be scoped per academic session
-- NOTE: fee_slabs stay session-independent (same fee structure across sessions)

ALTER TABLE fee_deposits ADD COLUMN session TEXT DEFAULT '';

-- Backfill existing deposits with the Active session name
UPDATE fee_deposits SET session = (
    SELECT name FROM academic_sessions
    WHERE academic_sessions.branch_id = fee_deposits.branch_id AND status = 'Active'
    LIMIT 1
) WHERE session = '' OR session IS NULL;
