// Netlify serverless function (v2) — records newsletter signups in a Railway
// Postgres database. The connection string is supplied via the DATABASE_URL
// environment variable (set in Netlify → Site settings → Environment variables);
// it is never committed to the repo.
//
// Responses:
//   201  new subscriber stored
//   409  already subscribed (treated as success by the client)
//   400  missing / invalid email
//   405  wrong method
//   503  DATABASE_URL not configured
//   500  database error

import pg from 'pg';

const { Pool } = pg;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Reuse the pool across warm invocations.
let pool;
let schemaReady;

// Verify TLS against a provided CA when available; otherwise fall back to
// Railway's public proxy, whose cert is outside the default CA bundle. Set
// PGSSLROOTCERT (the CA PEM) in Netlify to enable strict verification.
function sslConfig() {
  if (process.env.PGSSLROOTCERT) {
    return { ca: process.env.PGSSLROOTCERT, rejectUnauthorized: true };
  }
  return { rejectUnauthorized: false };
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig(),
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    });
  }
  return pool;
}

async function ensureSchema(client) {
  if (!schemaReady) {
    schemaReady = client
      .query(`
        CREATE TABLE IF NOT EXISTS subscribers (
          id          BIGSERIAL PRIMARY KEY,
          email       TEXT NOT NULL UNIQUE,
          lang        TEXT,
          source      TEXT,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS subscribers_created_at_idx ON subscribers (created_at DESC);
      `)
      // Don't cache a rejected promise, or every later request re-fails until
      // the container recycles.
      .catch((err) => {
        schemaReady = undefined;
        throw err;
      });
  }
  return schemaReady;
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export default async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  if (!process.env.DATABASE_URL) {
    return json({ error: 'not_configured' }, 503);
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const email = String(payload?.email ?? '').trim().toLowerCase();
  const lang = ['en', 'sq'].includes(payload?.lang) ? payload.lang : null;
  const source = typeof payload?.source === 'string' ? payload.source.slice(0, 60) : 'popup';

  if (!email || email.length > 320 || !EMAIL_RE.test(email)) {
    return json({ error: 'invalid_email' }, 400);
  }

  let client;
  try {
    client = await getPool().connect();
    await ensureSchema(client);
    const result = await client.query(
      `INSERT INTO subscribers (email, lang, source)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id;`,
      [email, lang, source]
    );

    if (result.rowCount === 0) {
      return json({ status: 'already_subscribed' }, 409);
    }
    return json({ status: 'subscribed' }, 201);
  } catch (err) {
    console.error('subscribe error:', err);
    return json({ error: 'server_error' }, 500);
  } finally {
    client?.release();
  }
};
