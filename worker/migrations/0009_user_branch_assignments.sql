CREATE TABLE IF NOT EXISTS user_branch_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    branch_id INTEGER NOT NULL,
    is_primary INTEGER DEFAULT 0,
    assigned_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, branch_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

INSERT OR IGNORE INTO user_branch_assignments (user_id, branch_id, is_primary)
SELECT u.id, u.branch_id, 1
FROM users u
WHERE u.branch_id IS NOT NULL;
