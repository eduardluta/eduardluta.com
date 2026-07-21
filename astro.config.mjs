// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export const SITE = 'https://eduardluta.com';

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
    }),
  ],
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
