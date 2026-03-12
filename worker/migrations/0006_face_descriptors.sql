-- ===== FACE RECOGNITION SUPPORT =====
-- Stores face descriptor vectors for biometric attendance.
-- Each person (student/staff) has one row containing multiple angle descriptors as JSON.

CREATE TABLE IF NOT EXISTS face_descriptors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    person_type TEXT NOT NULL CHECK(person_type IN ('student','staff')),
    person_id INTEGER NOT NULL,
    descriptors TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(branch_id, person_type, person_id)
);
