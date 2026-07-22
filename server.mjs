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
  // Collapse index.html onto its clean directory URL (/index.html -> /, /x/index.html -> /x/).
  if (req.path.endsWith('/index.html')) {
    return res.redirect(301, req.path.slice(0, -'index.html'.length));
  }
  const to = REDIRECTS[req.path] ?? (req.path === '/blog' || req.path.startsWith('/blog/') ? '/writing/' : null);
  if (to) return res.redirect(301, to);
  next();
});

// Immutable, fingerprinted build assets get a long cache.
app.use('/_astro', express.static(join(clientDir, '_astro'), { immutable: true, maxAge: '1y' }));
// Prerendered pages + other public assets.
app.use(express.static(clientDir));
// Astro handles on-demand routes (/api/subscribe) and the 404 page.
app.use(ssrHandler);

const port = Number(process.env.PORT) || 4321;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => console.log(`eduardluta.com listening on http://${host}:${port}`));
