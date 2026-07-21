// One-time TikTok OAuth helper — trades the painful authorize/redirect/exchange
// dance for two commands. Run via `npm run tiktok:auth` (loads .env).
//
//   Step 1:  npm run tiktok:auth
//            → prints an authorize URL. Open it (logged into TikTok), approve,
//              and you'll be redirected to your redirect URI with ?code=... in the URL.
//
//   Step 2:  npm run tiktok:auth "<paste the full redirected URL here>"
//            → exchanges the code for tokens and saves TIKTOK_REFRESH_TOKEN into .env.
//              Copy that same value into Netlify for production.
//
// Requires in .env: TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { hasStore, writeRefreshToken, closeStore } from './token-store.mjs';

const ENV_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
const SCOPE = 'user.info.basic,video.list';

const { TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI } = process.env;

function requireEnv() {
  const missing = ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_REDIRECT_URI'].filter(
    (k) => !process.env[k]
  );
  if (missing.length) {
    console.error(`Missing in .env: ${missing.join(', ')}`);
    process.exit(1);
  }
}

function upsertEnv(key, value) {
  let text = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : '';
  const line = `${key}="${value}"`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  text = re.test(text) ? text.replace(re, line) : text.replace(/\s*$/, '') + `\n${line}\n`;
  writeFileSync(ENV_PATH, text);
}

function printAuthUrl() {
  const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
  url.searchParams.set('client_key', TIKTOK_CLIENT_KEY);
  url.searchParams.set('scope', SCOPE);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI);
  url.searchParams.set('state', 'eduardluta');
  console.log('\n1) Open this URL (while logged into TikTok) and approve access:\n');
  console.log(url.toString());
  console.log('\n2) You will be redirected to your redirect URI. Copy the FULL URL from the');
  console.log('   address bar and run:\n');
  console.log('   npm run tiktok:auth "<paste that URL>"\n');
}

function extractCode(input) {
  try {
    const u = new URL(input);
    const code = u.searchParams.get('code');
    if (code) return code;
  } catch {
    /* not a URL — treat as a raw code */
  }
  return input.trim();
}

async function exchange(codeInput) {
  const code = decodeURIComponent(extractCode(codeInput));
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    client_secret: TIKTOK_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: TIKTOK_REDIRECT_URI,
  });
  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.refresh_token) {
    console.error('\nToken exchange failed:', body.error_description || body.error || `HTTP ${res.status}`);
    console.error(body);
    process.exit(1);
  }
  upsertEnv('TIKTOK_REFRESH_TOKEN', body.refresh_token);
  let seededDb = false;
  if (hasStore()) {
    seededDb = await writeRefreshToken('tiktok', body.refresh_token).catch((e) => {
      console.warn('  (could not seed the DB token store:', e.message + ')');
      return false;
    });
    await closeStore();
  }
  console.log('\n✓ Success. Saved TIKTOK_REFRESH_TOKEN to .env' + (seededDb ? ' and the DB store.' : '.'));
  console.log(`  open_id: ${body.open_id}`);
  console.log(`  scope:   ${body.scope}`);
  console.log(`  refresh token valid ~${Math.round((body.refresh_expires_in || 0) / 86400)} days.`);
  console.log('\nFor production, add these to Netlify env vars:');
  console.log('  TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET (same as .env)');
  console.log(`  TIKTOK_REFRESH_TOKEN  (seed value — the DB store keeps it fresh after the first build)`);
  console.log('\nNow run:  npm run feed   (then npm run build) to fetch your videos.\n');
}

requireEnv();
const arg = process.argv[2];
if (arg) {
  await exchange(arg);
} else {
  printAuthUrl();
}
