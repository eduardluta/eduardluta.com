# eduardluta.com

Personal website of Eduard Luta — a lean, bilingual (English ⇄ Albanian) static
site: bio, writing with a full article reader, projects, principles, a social
wall, and a newsletter capture. Monospace, warm paper / warm‑charcoal themes,
one pine accent.

Built with **[Astro](https://astro.build)** and deployed on **Netlify**. No CMS —
content lives natively in the repo as Markdown + typed data, pre‑rendered to
static HTML for best‑in‑class SEO.

## Tech

- **Astro 5** — static output, per‑page URLs, view transitions.
- **i18n** — English at the root (`/`), Albanian under `/sq/`, cross‑linked with
  `hreflang`. Content collections carry both languages.
- **SEO** — per‑page title/description, canonical, `hreflang` (incl. `x-default`),
  Open Graph + Twitter cards, JSON‑LD (`Person`, `WebSite`, `BlogPosting`,
  `BreadcrumbList`), `sitemap-index.xml`, `robots.txt`.
- **Fonts** — IBM Plex Mono, self‑hosted via `@fontsource` (no CLS, no third party).
- **Newsletter** — Netlify serverless function → Railway Postgres.

## Develop

```bash
npm install
npm run dev        # local dev server (http://localhost:4321)
npm run build      # production build → dist/
npm run preview    # serve the built dist/ locally
npm run assets     # regenerate favicons + OG image (public/*.png)
```

Node 22 is pinned (`.nvmrc`, `netlify.toml`).

## Project structure

```
src/
  content/writing/{en,sq}/<slug>.md   # articles — one file per language
  content.config.ts                   # writing collection schema
  data/                               # bio, principles, recommendations, projects, social (bilingual)
  i18n/ui.ts                          # all UI strings (EN + SQ)
  i18n/utils.ts                       # routing + date helpers
  lib/                                # writing loader, JSON-LD builders
  layouts/BaseLayout.astro            # <head>/SEO, theme script, chrome
  components/                         # Header, Footer, NewsletterPopup, cards, views
  scripts/app.ts                      # theme toggle + newsletter behaviour
  pages/                              # EN at root, SQ under /sq/
netlify/functions/subscribe.mjs       # newsletter → Railway
public/                               # favicon, icons, OG image, robots.txt, manifest
db/schema.sql                         # subscribers table
scripts/gen-assets.mjs                # PNG icon + OG generator
```

## Adding a new article (both languages required)

Every article **must** ship in English and Albanian, sharing one slug. Create:

- `src/content/writing/en/<slug>.md`
- `src/content/writing/sq/<slug>.md`

Each with frontmatter:

```yaml
---
title: Your Title
date: 2026-01-31
description: One-sentence summary used for SEO + social cards.
---

Body in Markdown…
```

The home "Latest writing" (top 3), the Writing list, sitemap, and the reader all
update automatically. Dates drive ordering (newest first).

Other content (bio, principles, "worth the time", projects, social wall) lives in
`src/data/*.ts` and `src/i18n/ui.ts` as `{ en, sq }` pairs.

## Newsletter → Railway (one-time setup)

The signup popup POSTs to `/api/subscribe`, which the Netlify function
`netlify/functions/subscribe.mjs` handles by inserting into a Railway Postgres
database. To wire it up:

1. **Create a Postgres database on [Railway](https://railway.app)** → New Project
   → *Provision PostgreSQL*.
2. **Copy the connection string** — in the Postgres service, *Variables* →
   `DATABASE_URL` (use the public URL, e.g.
   `postgresql://postgres:…@…proxy.rlwy.net:PORT/railway`).
3. *(Optional)* apply `db/schema.sql` in Railway's query console. The function
   also creates the `subscribers` table automatically on first call.
4. **In Netlify** → Site settings → *Environment variables* → add
   `DATABASE_URL` = the value from step 2. Redeploy.

That's it — the function reads `DATABASE_URL` at runtime; it is never committed.
Locally, copy `.env.example` to `.env` and run with `netlify dev` to exercise the
function.

Responses: `201` new signup · `409` already subscribed (treated as success) ·
`400` invalid email · `503` `DATABASE_URL` not set · `500` DB error.

## Deploy (Netlify)

`netlify.toml` already configures everything:

- Build command `npm run build`, publish `dist/`, functions `netlify/functions/`.
- `/api/subscribe` → the function; 301s from the old URLs (`/blog*`, etc.).
- Security + cache headers.

Connect the repo to Netlify, set the `DATABASE_URL` env var, and deploy. Point the
`eduardluta.com` domain at the site (DNS is already on Netlify).

## Notes

- The **social wall** is universal (mixed‑language, mirrors the real accounts).
  Captions, engagement counts, dates and media are placeholders until wired to
  live feeds/embeds.
- The **Albanian** copy is a solid first pass — worth a native proofread before a
  wide launch.
