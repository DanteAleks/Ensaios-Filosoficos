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
