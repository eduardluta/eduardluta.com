// MANUAL, guarded publish of a reviewed run to Binance Square. Never called by run.mjs.
// /content/add may return 504 AFTER the post went live: it is NEVER retried.
import { parseArgs } from './lib/args.mjs';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { basename, dirname, join, resolve } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const STATE = join(ROOT, 'state', 'published.json');
const GW = 'https://www.binance.com/bapi/composite';
const EP = {
  presign: `${GW}/v2/public/pgc/openApi/image/presignedUrl`,
  status: `${GW}/v2/public/pgc/openApi/image/imageStatus`,
  add: `${GW}/v1/public/pgc/openApi/content/add`,
};
const ERRORS = {
  220003: 'API key not found', 220004: 'API key expired', 220009: 'daily post cap reached (100/day)',
  220014: 'daily upload cap reached (400/day)', 20002: 'sensitive words in content', 20022: 'sensitive words in content',
  20013: 'content too long', 30008: 'account or device restricted', 2000001: 'account or device restricted', 2000002: 'account or device restricted',
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const die = (m) => { console.error(`REFUSED: ${m}`); process.exit(1); };
const readState = () => (existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {});
const writeState = (id, v) => {
  const s = readState();
  s[id] = v;
  mkdirSync(dirname(STATE), { recursive: true });
  writeFileSync(STATE, JSON.stringify(s, null, 2));
};

const a = parseArgs();
const key = process.env.SQUARE_OPENAPI_KEY;
const hdr = (k) => ({ 'X-Square-OpenAPI-Key': k, 'Content-Type': 'application/json', clienttype: 'binanceSkill' });

// Resolve run dir.
let runDir = a.run ? resolve(String(a.run)) : null;
if (!runDir) {
  const p = join(ROOT, 'runs', 'latest');
  if (existsSync(p)) runDir = JSON.parse(readFileSync(p, 'utf8')).dir;
}
if (!runDir || !existsSync(join(runDir, 'post.json'))) die('--run must resolve to a run directory containing post.json');
const runId = basename(runDir);
const post = JSON.parse(readFileSync(join(runDir, 'post.json'), 'utf8'));
const shotDir = join(runDir, 'shots');
const images = existsSync(shotDir) ? readdirSync(shotDir).filter((f) => f.endsWith('.png')).sort().slice(0, 4).map((f) => join(shotDir, f)) : [];

if (!a.confirm) die('pass --confirm to proceed (use --dry-run to preview)');
const prev = readState()[runId];
if (prev && (prev.status === 'published' || prev.status === 'unknown')) {
  die(`run ${runId} already has status "${prev.status}" in state/published.json. If "unknown", check your Square profile manually first.`);
}

if (a.dryRun) {
  console.log('DRY RUN: no network calls.');
  console.log(`run: ${runId}  state: ${prev?.status ?? 'none'}  key: ${key ? 'set' : 'MISSING (a real publish would refuse)'}`);
  console.log('headers:', JSON.stringify(hdr(key ? '[REDACTED]' : '[MISSING]'), null, 2));
  console.log('image endpoints:', EP.presign, '->', 'PUT bytes ->', EP.status);
  console.log('image files:', images.length ? images : '(none)');
  console.log(`POST ${EP.add}`);
  console.log('payload (imageList filled after upload):', JSON.stringify({ ...post, imageList: images.map(() => '<url after upload>') }, null, 2));
  process.exit(0);
}
if (!key) die('SQUARE_OPENAPI_KEY is not set');

const code = (j) => j?.code ?? j?.data?.code;
const okBody = (j) => j && (j.success === true || String(j.code) === '000000');
const explain = (j) => { const c = code(j); return ERRORS[c] ? `${c}: ${ERRORS[c]}` : `code ${c}: ${j?.message ?? j?.msg ?? 'unknown error'}`; };

async function call(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  console.error(`[${init.method} ${url.split('/openApi/')[1]}] ${res.status} ${text.slice(0, 300)}`);
  return { res, text, json };
}

// Defensive: pull a field from the body or one level of `data` nesting.
const pick = (j, ...names) => { for (const o of [j, j?.data, j?.data?.data]) for (const n of names) if (o && o[n] != null) return o[n]; };

async function uploadImage(file) {
  const bytes = readFileSync(file);
  const body = { fileName: basename(file), contentType: 'image/png', fileSize: bytes.length };
  console.error(`[presign request] ${JSON.stringify(body)}`);
  const p = await call(EP.presign, { method: 'POST', headers: hdr(key), body: JSON.stringify(body) });
  if (!p.res.ok || (p.json && !okBody(p.json))) throw new Error(`presign failed: ${p.json ? explain(p.json) : p.res.status}`);
  const uploadUrl = pick(p.json, 'presignedUrl', 'uploadUrl', 'url');
  const imageId = pick(p.json, 'imageId', 'id', 'fileId', 'imageKey', 'key');
  if (!uploadUrl) throw new Error(`presign: no upload URL in response ${p.text.slice(0, 200)}`);
  const put = await fetch(uploadUrl, { method: 'PUT', body: bytes, headers: { 'Content-Type': 'image/png' } });
  console.error(`[PUT upload] ${put.status}`);
  if (!put.ok) throw new Error(`image PUT failed: ${put.status}`);
  let finalUrl = pick(p.json, 'imageUrl', 'accessUrl', 'cdnUrl') ?? null;
  for (let i = 0; i < 20; i++) {
    const s = await call(EP.status, { method: 'POST', headers: hdr(key), body: JSON.stringify({ imageId, id: imageId, url: uploadUrl.split('?')[0] }) });
    const st = pick(s.json, 'status', 'imageStatus');
    const u = pick(s.json, 'imageUrl', 'url', 'accessUrl', 'cdnUrl');
    if (u) finalUrl = u;
    if (okBody(s.json) && (st === undefined || /^(1|ready|success|done|pass|passed|completed)$/i.test(String(st)) || u)) break;
    await sleep(1500);
  }
  return finalUrl ?? uploadUrl.split('?')[0];
}

const startedAt = new Date().toISOString();
const imageList = [];
try {
  for (const f of images) imageList.push(await uploadImage(f));
} catch (e) {
  console.error(`Image upload failed, nothing posted: ${e.message}`);
  writeState(runId, { status: 'failed', publishedAt: null, startedAt, response: { stage: 'images', error: e.message } });
  process.exit(1);
}

// Recorded as "unknown" BEFORE the call: a crash or a 504 must block any blind re-run.
writeState(runId, { status: 'unknown', publishedAt: null, startedAt, response: { note: 'content/add in flight' } });
const body = { contentType: 1, content: post.content, imageList };
let r;
try {
  r = await call(EP.add, { method: 'POST', headers: hdr(key), body: JSON.stringify(body) });
} catch (e) {
  writeState(runId, { status: 'unknown', publishedAt: null, startedAt, response: { networkError: e.message } });
  loud(`Network failure on /content/add: ${e.message}`);
  process.exit(2);
}
if (r.res.status === 504 || r.res.status >= 500 || !r.json) {
  writeState(runId, { status: 'unknown', publishedAt: null, startedAt, response: { http: r.res.status, body: r.text.slice(0, 500) } });
  loud(`/content/add returned HTTP ${r.res.status}`);
  process.exit(2);
}
if (r.res.ok && okBody(r.json)) {
  writeState(runId, { status: 'published', publishedAt: new Date().toISOString(), startedAt, response: r.json });
  console.log(`PUBLISHED run ${runId}`);
} else {
  writeState(runId, { status: 'failed', publishedAt: null, startedAt, response: r.json });
  console.error(`Square rejected the post: ${explain(r.json)}`);
  process.exit(1);
}

function loud(why) {
  console.error('\n' + '!'.repeat(64));
  console.error(`${why}. THE POST MAY HAVE GONE LIVE ANYWAY (Binance often 504s after success).`);
  console.error('CHECK YOUR BINANCE SQUARE PROFILE MANUALLY before any further attempt.');
  console.error(`Run ${runId} is marked "unknown" and will refuse re-publish. Edit state/published.json only after you have verified.`);
  console.error('!'.repeat(64));
}
