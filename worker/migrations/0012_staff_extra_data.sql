-- ===== ADD EXTRA_DATA JSON COLUMN TO STAFF =====
-- Stores attached documents and future staff metadata that do not have
-- dedicated SQL columns yet.

ALTER TABLE staff ADD COLUMN extra_data TEXT DEFAULT '{}';
