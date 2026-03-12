-- ===== ONLINE PAYMENT REQUESTS =====
CREATE TABLE IF NOT EXISTS online_payment_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    parent_phone TEXT,
    request_date TEXT NOT NULL,
    month TEXT NOT NULL,
    requested_amount REAL DEFAULT 0,
    transaction_id TEXT NOT NULL,
    payment_proof_url TEXT,
    parent_note TEXT,
    admin_note TEXT,
    status TEXT NOT NULL DEFAULT 'Requested' CHECK(status IN ('Requested','Accepted','Rejected')),
    receipt_id INTEGER,
    reviewed_at TEXT,
    reviewed_by INTEGER,
    session TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (receipt_id) REFERENCES fee_deposits(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_online_payment_requests_branch_status
ON online_payment_requests (branch_id, status, request_date);

CREATE INDEX IF NOT EXISTS idx_online_payment_requests_student
ON online_payment_requests (student_id, month);
