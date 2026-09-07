CREATE TABLE IF NOT EXISTS private_messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 request_id TEXT NOT NULL UNIQUE,
 payload_hash TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('message','email_click')),
 work TEXT NOT NULL,
 title TEXT NOT NULL,
 name TEXT NOT NULL DEFAULT '',
 email TEXT NOT NULL DEFAULT '',
 message TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','read','replied','archived')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS messages_status ON private_messages(status);
