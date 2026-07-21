import type { APIRoute } from 'astro';
import pg from 'pg';

// Rendered on demand (the rest of the site is prerendered/static).
export const prerender = false;

const { Pool } = pg;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let pool: pg.Pool | undefined;
let schemaReady: Promise<unknown> | undefined;

function sslConfig(url: string): pg.PoolConfig['ssl'] {
  if (process.env.PGSSLROOTCERT) {
    return { ca: process.env.PGSSLROOTCERT, rejectUnauthorized: true };
  }
  // Railway internal networking (…​.railway.internal) does not use TLS.
  if (url.includes('.railway.internal')) return false;
  // Public proxies present certs outside the default CA bundle.
  return { rejectUnauthorized: false };
}

function getPool(url: string): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: sslConfig(url),
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    });
  }
  return pool;
}

function ensureSchema(client: pg.PoolClient) {
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
      .catch((err) => {
        schemaReady = undefined;
        throw err;
      });
  }
  return schemaReady;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const url = process.env.DATABASE_URL;
  if (!url) return json({ error: 'not_configured' }, 503);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const email = String(payload?.email ?? '').trim().toLowerCase();
  const lang = payload?.lang === 'en' || payload?.lang === 'sq' ? payload.lang : null;
  const source = typeof payload?.source === 'string' ? payload.source.slice(0, 60) : 'popup';

  if (!email || email.length > 320 || !EMAIL_RE.test(email)) {
    return json({ error: 'invalid_email' }, 400);
  }

  let client: pg.PoolClient | undefined;
  try {
    client = await getPool(url).connect();
    await ensureSchema(client);
    const result = await client.query(
      `INSERT INTO subscribers (email, lang, source)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id;`,
      [email, lang, source]
    );
    if (result.rowCount === 0) return json({ status: 'already_subscribed' }, 409);
    return json({ status: 'subscribed' }, 201);
  } catch (err) {
    console.error('subscribe error:', err);
    return json({ error: 'server_error' }, 500);
  } finally {
    client?.release();
  }
};
