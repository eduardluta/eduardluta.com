// Production server for Railway. Wraps the Astro Node handler (middleware mode)
// with an Express layer that adds security headers to every response, handles the
// legacy 301 redirects, and serves the prerendered/static build. On-demand routes
// (the newsletter API) are handled by the Astro handler.
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { handler as ssrHandler } from './dist/server/entry.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDir = join(__dirname, 'dist', 'client');
const notFoundPage = join(clientDir, '404.html');

const app = express();
app.disable('x-powered-by');

// Security headers on every response (static pages included).
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://*.googletagmanager.com; font-src 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'"
  );
  next();
});

// Legacy 301s preserving SEO from the previous multi-page site.
const REDIRECTS = {
  '/blog.html': '/writing/',
  '/principles.html': '/principles/',
  '/worth-the-time.html': '/writing/',
};
app.use((req, res, next) => {
  // Preserve query strings across redirects (e.g. utm params).
  const qs = req.originalUrl.includes('?')
    ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
    : '';
  // Collapse index.html onto its clean directory URL (/index.html -> /, /x/index.html -> /x/).
  if (req.path.endsWith('/index.html')) {
    return res.redirect(301, req.path.slice(0, -'index.html'.length) + qs);
  }
  const to = REDIRECTS[req.path] ?? (req.path === '/blog' || req.path.startsWith('/blog/') ? '/writing/' : null);
  if (to) return res.redirect(301, to + qs);
  next();
});

// Astro emits the 404 route as a flat /404.html (never /404/index.html), so the
// static middleware can't serve /404/ and the ssrHandler 500s on it — handle it
// explicitly before the handler ever sees it.
app.get(['/404', '/404/'], (_req, res) => res.status(404).sendFile(notFoundPage));

// Immutable, fingerprinted build assets get a long cache.
app.use('/_astro', express.static(join(clientDir, '_astro'), { immutable: true, maxAge: '1y' }));
// Prerendered pages + other public assets. Images/fonts are not content-hashed,
// so they get a 30d cache (ETag/Last-Modified still allow cheap 304s after);
// HTML stays revalidated on every request.
app.use(
  express.static(clientDir, {
    setHeaders(res, path) {
      if (/\.(webp|avif|png|jpe?g|gif|svg|ico|woff2?)$/.test(path)) {
        res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
      } else if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
  })
);
// Astro handles on-demand routes (/api/subscribe).
app.use(ssrHandler);
// Anything neither the static build nor Astro claimed: the branded 404.
app.use((_req, res) => res.status(404).sendFile(notFoundPage));

const port = Number(process.env.PORT) || 4321;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`eduardluta.com listening on http://${host}:${port}`);
  // IndexNow: tell Bing & friends the deployed URLs changed. Railway-only (the
  // env var only exists there), fire-and-forget, fail-soft inside the script.
  if (process.env.RAILWAY_ENVIRONMENT_NAME) {
    import('./scripts/indexnow-ping.mjs').catch(() => {});
  }
});
