-- Add session column to fee_slabs so fee structures are session-specific
-- This prevents fee increases in a new session from affecting old session students
ALTER TABLE fee_slabs ADD COLUMN session TEXT DEFAULT '';

-- Add session column to fee_discounts so discounts are session-scoped
ALTER TABLE fee_discounts ADD COLUMN session TEXT DEFAULT '';
