-- ADMS request diagnostics for ZKTeco devices.
-- Keeps a lightweight audit trail of every /iclock request so support can
-- distinguish real device traffic from browser/manual tests.

CREATE TABLE IF NOT EXISTS adms_request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_number TEXT,
    device_id INTEGER,
    endpoint TEXT,
    method TEXT,
    query_string TEXT,
    user_agent TEXT,
    ip_address TEXT,
    payload_preview TEXT,
    received_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE INDEX IF NOT EXISTS idx_adms_request_logs_serial_time
ON adms_request_logs (serial_number, received_at);

CREATE INDEX IF NOT EXISTS idx_adms_request_logs_endpoint_time
ON adms_request_logs (endpoint, received_at);
