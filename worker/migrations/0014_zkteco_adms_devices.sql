-- ZKTeco ADMS device integration.
-- Additive only: this keeps the live schema untouched and stores device data
-- beside the existing browser-based face descriptor attendance feature.

CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_name TEXT NOT NULL,
    serial_number TEXT NOT NULL UNIQUE,
    branch_id INTEGER NOT NULL,
    school_id INTEGER,
    location TEXT,
    status TEXT DEFAULT 'offline' CHECK(status IN ('online','offline')),
    last_seen TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE INDEX IF NOT EXISTS idx_devices_branch_status ON devices (branch_id, status, last_seen);
CREATE INDEX IF NOT EXISTS idx_devices_serial ON devices (serial_number);

CREATE TABLE IF NOT EXISTS attendance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    user_type TEXT NOT NULL DEFAULT 'unknown' CHECK(user_type IN ('student','staff','unknown')),
    device_serial TEXT NOT NULL,
    branch_id INTEGER,
    school_id INTEGER,
    punch_time TEXT NOT NULL,
    punch_minute TEXT NOT NULL,
    punch_type TEXT NOT NULL DEFAULT 'IN' CHECK(punch_type IN ('IN','OUT')),
    zk_pin TEXT,
    verify_type TEXT,
    work_code TEXT,
    raw_payload TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_logs_dedupe
ON attendance_logs (device_serial, zk_pin, punch_minute);

CREATE INDEX IF NOT EXISTS idx_attendance_logs_branch_time
ON attendance_logs (branch_id, punch_time);

CREATE INDEX IF NOT EXISTS idx_attendance_logs_user_time
ON attendance_logs (user_type, user_id, punch_time);

CREATE TABLE IF NOT EXISTS face_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    user_type TEXT NOT NULL CHECK(user_type IN ('student','staff')),
    photo_path TEXT,
    device_serial TEXT NOT NULL,
    branch_id INTEGER NOT NULL,
    school_id INTEGER,
    target_pin TEXT NOT NULL,
    registration_status TEXT NOT NULL DEFAULT 'pending' CHECK(registration_status IN ('pending','success','failed')),
    registered_at TEXT,
    last_error TEXT,
    last_push_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, user_type, device_serial),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE INDEX IF NOT EXISTS idx_face_registrations_branch_user
ON face_registrations (branch_id, user_type, user_id);

CREATE INDEX IF NOT EXISTS idx_face_registrations_device_status
ON face_registrations (device_serial, registration_status);

CREATE TABLE IF NOT EXISTS device_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_serial TEXT NOT NULL,
    branch_id INTEGER,
    school_id INTEGER,
    face_registration_id INTEGER,
    command_type TEXT NOT NULL DEFAULT 'generic',
    command_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sent','success','failed')),
    attempts INTEGER DEFAULT 0,
    sent_at TEXT,
    result_code TEXT,
    result_text TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (face_registration_id) REFERENCES face_registrations(id)
);

CREATE INDEX IF NOT EXISTS idx_device_commands_serial_status
ON device_commands (device_serial, status, id);

CREATE INDEX IF NOT EXISTS idx_device_commands_face_registration
ON device_commands (face_registration_id);

CREATE TABLE IF NOT EXISTS unknown_device_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_number TEXT,
    endpoint TEXT,
    method TEXT,
    query_string TEXT,
    payload TEXT,
    received_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_unknown_device_logs_serial_time
ON unknown_device_logs (serial_number, received_at);
