// Mutable OAuth-token store backed by the Railway Postgres database (same
// DATABASE_URL as the newsletter function). TikTok rotates its refresh token on
// every refresh, so a build-only env var would break after one rebuild — the
// build reads the latest token here, refreshes, and writes the new one back.
//
// If DATABASE_URL is not set, every function no-ops (returns null/false) and the
// caller falls back to the TIKTOK_REFRESH_TOKEN env var for a one-off local test.

import pg from 'pg';

const { Pool } = pg;

let pool;

function sslConfig(url) {
  if (process.env.PGSSLROOTCERT) return { ca: process.env.PGSSLROOTCERT, rejectUnauthorized: true };
  // Railway internal networking (…​.railway.internal) does not use TLS.
  if (url.includes('.railway.internal')) return false;
  return { rejectUnauthorized: false };
}

function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: sslConfig(url),
      max: 2,
      connectionTimeoutMillis: 8_000,
    });
  }
  return pool;
}

export function hasStore() {
  return Boolean(process.env.DATABASE_URL);
}

async function ensure(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS oauth_tokens (
      provider      TEXT PRIMARY KEY,
      refresh_token TEXT NOT NULL,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export async function readRefreshToken(provider) {
  const p = getPool();
  if (!p) return null;
  const client = await p.connect();
  try {
    await ensure(client);
    const res = await client.query('SELECT refresh_token FROM oauth_tokens WHERE provider = $1', [provider]);
    return res.rows[0]?.refresh_token ?? null;
  } finally {
    client.release();
  }
}

export async function writeRefreshToken(provider, token) {
  const p = getPool();
  if (!p) return false;
  const client = await p.connect();
  try {
    await ensure(client);
    await client.query(
      `INSERT INTO oauth_tokens (provider, refresh_token, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (provider) DO UPDATE SET refresh_token = EXCLUDED.refresh_token, updated_at = now();`,
      [provider, token]
    );
    return true;
  } finally {
    client.release();
  }
}

export async function closeStore() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
