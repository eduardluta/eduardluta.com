-- Newsletter subscribers — runs on the Railway Postgres database.
-- The serverless function also creates this table lazily, so applying it by hand
-- is optional, but it documents the shape and lets you seed indexes up front.

CREATE TABLE IF NOT EXISTS subscribers (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  lang        TEXT,
  source      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookups by signup time (e.g. exporting recent subscribers).
CREATE INDEX IF NOT EXISTS subscribers_created_at_idx ON subscribers (created_at DESC);
