CREATE TABLE IF NOT EXISTS parent_student_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    parent_phone TEXT NOT NULL,
    request_type TEXT NOT NULL,
    template_key TEXT,
    subject TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'Normal',
    from_date TEXT,
    to_date TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    admin_remarks TEXT,
    reviewed_by INTEGER,
    reviewed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_parent_student_requests_branch ON parent_student_requests(branch_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_requests_student ON parent_student_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_requests_parent ON parent_student_requests(parent_phone);
CREATE INDEX IF NOT EXISTS idx_parent_student_requests_status ON parent_student_requests(status);
CREATE INDEX IF NOT EXISTS idx_parent_student_requests_created ON parent_student_requests(created_at);
