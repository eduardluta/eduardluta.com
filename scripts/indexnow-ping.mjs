// IndexNow ping — notifies Bing (and other participating engines: Yandex, Seznam,
// Naver, …) that the site's URLs changed, for near-instant recrawl. Imported
// fire-and-forget by server.mjs after the server starts on Railway, so the ping
// always happens while the NEW deploy is the one being served.
//
// The key is public by design: hosting /<key>.txt at the site root is what proves
// domain control (see public/<key>.txt). Fail-soft throughout — a flaky ping must
// never affect the server.
import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const HOST = 'eduardluta.com';
const KEY = process.env.INDEXNOW_KEY || 'db58d3b51f3702b5534cc5384bfc944f';
// Give Railway time to finish switching traffic to this container before Bing crawls.
const DELAY_MS = 90_000;

const __dirname = dirname(fileURLToPath(import.meta.url));

async function urlsFromSitemap() {
  const xml = await readFile(join(__dirname, '..', 'dist', 'client', 'sitemap-0.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function ping() {
  try {
    // One ping per deployment: a process-supervisor crash loop inside the same
    // container must not resubmit unchanged URLs (IndexNow deprioritizes hosts
    // that spam identical submissions). Fresh deploys get a fresh filesystem.
    const marker = join(
      tmpdir(),
      `indexnow-${process.env.RAILWAY_DEPLOYMENT_ID ?? 'local'}`
    );
    if (await access(marker).then(() => true, () => false)) return;
    await writeFile(marker, new Date().toISOString());

    const urlList = await urlsFromSitemap();
    if (urlList.length === 0) return;
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList,
      }),
    });
    // 200 = OK, 202 = accepted (key validation pending) — both fine.
    console.log(`indexnow: submitted ${urlList.length} URLs, status ${res.status}`);
  } catch (err) {
    console.warn('indexnow: ping skipped —', err?.message ?? err);
  }
}

setTimeout(ping, DELAY_MS);
