-- ===== EMAIL LOG TABLE (replaces sms_log) =====
CREATE TABLE IF NOT EXISTS email_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    recipient_type TEXT,
    recipient_id INTEGER,
    email TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'Sent',
    sent_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);
