CREATE TABLE IF NOT EXISTS reactions (
 work TEXT NOT NULL,
 voter TEXT NOT NULL,
 value TEXT NOT NULL CHECK(value IN ('like','dislike')),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(work,voter)
);
CREATE INDEX IF NOT EXISTS reactions_counts ON reactions(work,value);
CREATE TABLE IF NOT EXISTS rate_limits (
 bucket TEXT PRIMARY KEY,
 day TEXT NOT NULL,
 attempts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_days ON rate_limits(day);
-- This view is for the private Cloudflare D1 console only.
CREATE VIEW IF NOT EXISTS resumo_avaliacoes AS
 SELECT work AS texto,
 SUM(CASE WHEN value='like' THEN 1 ELSE 0 END) AS coracoes,
 SUM(CASE WHEN value='dislike' THEN 1 ELSE 0 END) AS nao_gostei
 FROM reactions GROUP BY work;
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
