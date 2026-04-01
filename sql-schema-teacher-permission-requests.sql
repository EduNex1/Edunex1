-- ============================================================================
-- TEACHER PERMISSION REQUESTS TABLE
-- Run this SINGLE statement in Cloudflare D1 Console
-- ============================================================================

CREATE TABLE IF NOT EXISTS teacher_permission_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    request_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'Normal',
    status TEXT NOT NULL DEFAULT 'Pending',
    admin_remarks TEXT,
    reviewed_by INTEGER,
    reviewed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Run these SEPARATELY after table is created:
-- CREATE INDEX idx_tpr_branch_id ON teacher_permission_requests(branch_id);
-- CREATE INDEX idx_tpr_staff_id ON teacher_permission_requests(staff_id);
-- CREATE INDEX idx_tpr_status ON teacher_permission_requests(status);
