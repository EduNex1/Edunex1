-- Migration 0004: Add display_order to subjects table
ALTER TABLE subjects ADD COLUMN display_order INTEGER DEFAULT 0;
