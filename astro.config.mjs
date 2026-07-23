// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import { readFileSync, readdirSync } from 'node:fs';

export const SITE = 'https://eduardluta.com';

// Sitemap <lastmod> for essays, from frontmatter (`updated`, falling back to
// `date`). astro:content isn't available in the config, so read the markdown
// frontmatter directly; static pages simply get no lastmod (better than a fake
// build-time date, which trains crawlers to ignore the signal).
function writingLastmod() {
  /** @type {Record<string, string>} */
  const map = {};
  for (const lang of ['en', 'sq']) {
    const dir = new URL(`./src/content/writing/${lang}/`, import.meta.url);
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      const fm = readFileSync(new URL(file, dir), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      const date = fm.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
      const updated = fm.match(/^updated:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
      const lastmod = updated ?? date;
      if (!lastmod) continue;
      const slug = file.replace(/\.md$/, '');
      map[`${lang === 'sq' ? '/sq' : ''}/writing/${slug}/`] = lastmod;
    }
  }
  return map;
}
const WRITING_LASTMOD = writingLastmod();

// https://astro.build/config
export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  // Runs on Railway behind a small Express wrapper (server.mjs) that adds security
  // headers + legacy redirects and serves the static assets. Pages are prerendered
  // (static); only routes that opt out with `export const prerender = false` (the
  // newsletter API) are rendered on demand by the Astro handler.
  output: 'static',
  adapter: node({ mode: 'middleware' }),
  build: {
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'sq'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          sq: 'sq',
        },
      },
      serialize(item) {
        const lastmod = WRITING_LASTMOD[new URL(item.url).pathname];
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
