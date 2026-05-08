-- Add per-device face template capacity for ZKTeco Horus devices.
-- Horus TL2 face capacity can vary by model/storage, so keep it configurable.

ALTER TABLE devices ADD COLUMN face_capacity INTEGER NOT NULL DEFAULT 800;
