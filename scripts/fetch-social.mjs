// Build-time social feed fetcher. Pulls recent X + Instagram + TikTok posts,
// caches and optimizes their images locally (platform CDN URLs are signed and
// expire, so they MUST be downloaded at build), and writes
// src/data/social-feed.json which the site reads. Runs before `astro build`
// (see package.json).
//
// Fully resilient: missing tokens or any API/network failure just yields an empty
// (or partial) feed. It never throws out, so a flaky platform can never break a
// deploy.
//
// Required env (set in Railway → service Variables):
//   X_BEARER_TOKEN        X API v2 app Bearer token (pay-per-use project).
//                         Reading our own tweets bills as "owned reads"
//                         ($0.001/resource) — a daily build costs cents/month.
//   X_USER_ID             (optional) numeric X user id; skips one user-lookup
//                         read per build when set
//   INSTAGRAM_TOKEN       long-lived Instagram Graph API access token
//   INSTAGRAM_USER_ID     (optional) IG Business account id; if set, queries
//                         graph.facebook.com/{id}/media, else graph.instagram.com/me/media
//   TIKTOK_TOKEN          TikTok Display API user access token
//   SOCIAL_X_LIMIT        (optional) number of tweets, default 3
//   SOCIAL_IG_LIMIT       (optional) number of IG posts, default 6
//   SOCIAL_TT_LIMIT       (optional) number of TikTok posts, default 4

import sharp from 'sharp';
import { readRefreshToken, writeRefreshToken, closeStore } from './token-store.mjs';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IMG_DIR = join(ROOT, 'public', 'social');
const FEED_FILE = join(ROOT, 'src', 'data', 'social-feed.json');

const IG_HANDLE = '@eduard.luta';
const TT_HANDLE = '@eduardluta';
const X_USERNAME = 'eduardluta';
const IG_GRAPH = 'v21.0';

const IG_LIMIT = Number(process.env.SOCIAL_IG_LIMIT || 6);
const TT_LIMIT = Number(process.env.SOCIAL_TT_LIMIT || 4);
const X_LIMIT = Number(process.env.SOCIAL_X_LIMIT || 3);

const FETCH_TIMEOUT = 15_000;

async function fetchJson(url, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

function compact(n) {
  if (n == null || Number.isNaN(Number(n))) return null;
  const num = Number(n);
  if (num < 1000) return String(num);
  if (num < 1_000_000) {
    const k = num / 1000;
    return (k < 10 ? k.toFixed(1).replace(/\.0$/, '') : Math.round(k)) + 'k';
  }
  return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
}

function truncate(text, max = 120) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean;
}

// Relative time, localized (EN + SQ). Computed at build; refreshed each rebuild.
function relativeDate(ms, now) {
  const s = Math.max(0, Math.floor((now - ms) / 1000));
  const mk = (n, enOne, enMany, sqOne, sqMany) => ({
    en: n === 1 ? enOne : `${n} ${enMany} ago`,
    sq: n === 1 ? sqOne : `para ${n} ${sqMany}`,
  });
  if (s < 60) return { en: 'just now', sq: 'tani' };
  const m = Math.floor(s / 60);
  if (m < 60) return mk(m, '1 minute ago', 'minutes', 'para një minute', 'minutash');
  const h = Math.floor(m / 60);
  if (h < 24) return mk(h, '1 hour ago', 'hours', 'para një ore', 'orësh');
  const d = Math.floor(h / 24);
  if (d < 7) return mk(d, '1 day ago', 'days', 'para një dite', 'ditësh');
  const w = Math.floor(d / 7);
  if (w < 5) return mk(w, '1 week ago', 'weeks', 'para një jave', 'javësh');
  const mo = Math.floor(d / 30);
  if (mo < 12) return mk(mo, '1 month ago', 'months', 'para një muaji', 'muajsh');
  const y = Math.floor(d / 365);
  return mk(y, '1 year ago', 'years', 'para një viti', 'vitesh');
}

async function cacheImage(url, name, aspect) {
  const [w, h] = aspect === 'portrait' ? [720, 1280] : [720, 720];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`image ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).resize(w, h, { fit: 'cover' }).webp({ quality: 80 }).toFile(join(IMG_DIR, name));
    return `/social/${name}`;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchInstagram(now) {
  const token = process.env.INSTAGRAM_TOKEN;
  if (!token) return [];
  const userId = process.env.INSTAGRAM_USER_ID;
  const base = userId
    ? `https://graph.facebook.com/${IG_GRAPH}/${userId}/media`
    : `https://graph.instagram.com/me/media`;
  const full = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
  const basic = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';

  const query = (fields) => `${base}?fields=${fields}&limit=${IG_LIMIT}&access_token=${token}`;
  let { ok, body } = await fetchJson(query(full));
  if (!ok) {
    // Retry without engagement counts (may be unavailable for the account type).
    ({ ok, body } = await fetchJson(query(basic)));
  }
  if (!ok || !Array.isArray(body?.data)) {
    console.warn('[social] Instagram fetch failed:', body?.error?.message || `HTTP`);
    return [];
  }

  const out = [];
  for (const m of body.data) {
    try {
      const imgUrl = m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url;
      if (!imgUrl) continue;
      const image = await cacheImage(imgUrl, `ig-${m.id}.webp`, 'square');
      const ms = Date.parse(m.timestamp) || now;
      const meta = [compact(m.like_count) && `${compact(m.like_count)} likes`, compact(m.comments_count) && `${compact(m.comments_count)} comments`]
        .filter(Boolean)
        .join(' · ');
      out.push({
        platform: 'Instagram',
        handle: IG_HANDLE,
        href: m.permalink,
        caption: truncate(m.caption),
        meta,
        date: relativeDate(ms, now),
        media: 'square',
        image,
        timestamp: ms,
      });
    } catch (err) {
      console.warn(`[social] skipped IG ${m.id}:`, err.message);
    }
  }
  return out;
}

// X (Twitter) via the official API v2 with an app Bearer token. We read only our
// own recent tweets (no replies/retweets), which bills at the cheap "owned reads"
// rate on the pay-per-use plan. Media photos are cached locally like IG/TikTok;
// text-only tweets render as typographic cards.
async function fetchX(now) {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return [];
  const headers = { Authorization: `Bearer ${token}` };

  let userId = process.env.X_USER_ID;
  if (!userId) {
    const { ok, body } = await fetchJson(`https://api.x.com/2/users/by/username/${X_USERNAME}`, { headers });
    userId = body?.data?.id;
    if (!ok || !userId) {
      console.warn('[social] X user lookup failed:', body?.title || body?.detail || 'HTTP');
      return [];
    }
  }

  const params = new URLSearchParams({
    // API minimum is 5; we slice down to X_LIMIT after filtering.
    max_results: '5',
    exclude: 'replies,retweets',
    'tweet.fields': 'created_at,public_metrics,attachments',
    expansions: 'attachments.media_keys',
    'media.fields': 'url,preview_image_url,type',
  });
  const { ok, body } = await fetchJson(`https://api.x.com/2/users/${userId}/tweets?${params}`, { headers });
  if (!ok || !Array.isArray(body?.data)) {
    console.warn('[social] X fetch failed:', body?.title || body?.detail || 'HTTP');
    return [];
  }
  const mediaByKey = new Map((body.includes?.media || []).map((m) => [m.media_key, m]));

  const out = [];
  for (const tw of body.data.slice(0, X_LIMIT)) {
    try {
      const ms = Date.parse(tw.created_at) || now;
      const pm = tw.public_metrics || {};
      const meta = [
        pm.retweet_count > 0 && `${compact(pm.retweet_count)} reposts`,
        pm.like_count > 0 && `${compact(pm.like_count)} likes`,
      ]
        .filter(Boolean)
        .join(' · ');
      // Media/quote t.co links at the end of the text are noise on a card.
      const text = (tw.text || '').replace(/\s*https:\/\/t\.co\/\S+\s*$/g, '').trim();
      if (!text && !tw.attachments) continue;

      const post = {
        platform: 'X / Twitter',
        handle: `@${X_USERNAME}`,
        href: `https://x.com/${X_USERNAME}/status/${tw.id}`,
        caption: truncate(text, 240),
        meta,
        date: relativeDate(ms, now),
        timestamp: ms,
      };
      const firstKey = tw.attachments?.media_keys?.[0];
      const media = firstKey ? mediaByKey.get(firstKey) : null;
      const imgUrl = media?.url || media?.preview_image_url;
      if (imgUrl) {
        post.image = await cacheImage(imgUrl, `x-${tw.id}.webp`, 'square');
        post.media = 'square';
      }
      out.push(post);
    } catch (err) {
      console.warn(`[social] skipped tweet ${tw.id}:`, err.message);
    }
  }
  return out;
}

// TikTok access tokens expire in ~24h, so at build time we mint a fresh one from
// the long-lived (~365d) refresh token. TIKTOK_TOKEN is still honored for a quick
// within-the-day test.
async function resolveTikTokToken() {
  const { TIKTOK_TOKEN, TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET } = process.env;
  if (TIKTOK_CLIENT_KEY && TIKTOK_CLIENT_SECRET) {
    // Prefer the rotating token persisted in the DB; fall back to the env seed.
    const stored = await readRefreshToken('tiktok').catch(() => null);
    const refreshToken = stored || process.env.TIKTOK_REFRESH_TOKEN;
    if (refreshToken) {
      const params = new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      const { ok, body } = await fetchJson('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (ok && body?.access_token) {
        // TikTok rotates the refresh token — persist the new one for next build.
        if (body.refresh_token && body.refresh_token !== refreshToken) {
          await writeRefreshToken('tiktok', body.refresh_token).catch((e) =>
            console.warn('[social] could not persist rotated TikTok refresh token:', e.message)
          );
        }
        return body.access_token;
      }
      console.warn('[social] TikTok token refresh failed:', body?.error_description || body?.error || 'HTTP');
      return null;
    }
  }
  return TIKTOK_TOKEN || null;
}

async function fetchTikTok(now, token) {
  if (!token) return [];
  const fields = 'id,title,video_description,cover_image_url,share_url,like_count,comment_count,view_count,create_time';
  const { ok, body } = await fetchJson(`https://open.tiktokapis.com/v2/video/list/?fields=${fields}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ max_count: TT_LIMIT }),
  });
  const videos = body?.data?.videos;
  if (!ok || !Array.isArray(videos)) {
    console.warn('[social] TikTok fetch failed:', body?.error?.message || 'HTTP');
    return [];
  }

  const out = [];
  for (const v of videos) {
    try {
      if (!v.cover_image_url) continue;
      const image = await cacheImage(v.cover_image_url, `tt-${v.id}.webp`, 'portrait');
      const ms = (Number(v.create_time) || 0) * 1000 || now;
      const meta = [compact(v.view_count) && `${compact(v.view_count)} views`, compact(v.like_count) && `${compact(v.like_count)} likes`]
        .filter(Boolean)
        .join(' · ');
      out.push({
        platform: 'TikTok',
        handle: TT_HANDLE,
        href: v.share_url,
        caption: truncate(v.title || v.video_description),
        meta,
        date: relativeDate(ms, now),
        media: 'portrait',
        image,
        timestamp: ms,
      });
    } catch (err) {
      console.warn(`[social] skipped TikTok ${v.id}:`, err.message);
    }
  }
  return out;
}

async function main() {
  const now = Date.now();
  const hasTikTokCreds = Boolean(
    process.env.TIKTOK_TOKEN || (process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET)
  );
  const tiktokToken = hasTikTokCreds
    ? await resolveTikTokToken().catch((e) => (console.warn('[social] TikTok auth error:', e.message), null))
    : null;

  const configured = Boolean(process.env.X_BEARER_TOKEN || process.env.INSTAGRAM_TOKEN || tiktokToken);
  if (!configured) {
    console.log('[social] No X/Instagram/TikTok credentials set — wall will be empty.');
    writeFileSync(FEED_FILE, JSON.stringify({ generatedAt: null, posts: [] }, null, 2));
    return;
  }

  rmSync(IMG_DIR, { recursive: true, force: true });
  mkdirSync(IMG_DIR, { recursive: true });

  const [x, ig, tt] = await Promise.all([
    fetchX(now).catch((e) => (console.warn('[social] X error:', e.message), [])),
    fetchInstagram(now).catch((e) => (console.warn('[social] IG error:', e.message), [])),
    fetchTikTok(now, tiktokToken).catch((e) => (console.warn('[social] TikTok error:', e.message), [])),
  ]);

  const posts = [...x, ...ig, ...tt].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
  writeFileSync(FEED_FILE, JSON.stringify({ generatedAt: new Date(now).toISOString(), posts }, null, 2));
  console.log(`[social] Wrote ${posts.length} live posts (X ${x.length}, IG ${ig.length}, TikTok ${tt.length}).`);
  await closeStore();
}

main().catch((err) => {
  // Last-resort guard: never fail the build over the social feed.
  console.warn('[social] Unexpected error, falling back to curated wall:', err?.message);
  try {
    writeFileSync(FEED_FILE, JSON.stringify({ generatedAt: null, posts: [] }, null, 2));
  } catch {
    /* ignore */
  }
  process.exit(0);
});
