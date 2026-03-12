-- ===== ADD OLD BALANCE FOR FEE CARRY-FORWARD =====
-- Stores accumulated unpaid balances from previous sessions.
-- Updated during student promotion; reduced when old balance is paid off.

ALTER TABLE students ADD COLUMN old_balance REAL DEFAULT 0;
