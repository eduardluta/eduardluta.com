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

## Live social wall (Instagram + TikTok)

The social wall fetches your recent **Instagram** and **TikTok** posts at build
time ([`scripts/fetch-social.mjs`](scripts/fetch-social.mjs)), caches + optimizes
their images locally (platform image URLs expire, so they're downloaded into
`public/social/`), and writes `src/data/social-feed.json`. X / LinkedIn have no
practical public API, so those two cards stay curated in
[`src/data/social.ts`](src/data/social.ts) — edit them by hand.

If no tokens are set, the wall shows the curated fallback, so nothing breaks.

**Instagram** (needs a Business/Creator account):
1. Switch the IG account to **Business or Creator** and link it to a Facebook Page.
2. Create an app at [developers.facebook.com](https://developers.facebook.com) and add **Instagram Graph API**.
3. Generate a **long-lived access token** (`instagram_basic`) and note your IG Business account id.
4. In Netlify set `INSTAGRAM_TOKEN` (and optionally `INSTAGRAM_USER_ID`).
   ⚠️ Long-lived tokens expire ~60 days — refresh it before then.

**TikTok**:
1. Create an app at [developers.tiktok.com](https://developers.tiktok.com) with the **Display API** and the `video.list` scope.
2. Complete the OAuth flow to get a user access token.
3. In Netlify set `TIKTOK_TOKEN`.

**Keep it fresh** (optional): create a Netlify **build hook** (Site configuration →
Build hooks) and set its URL as `NETLIFY_BUILD_HOOK`. The scheduled function
[`refresh-social.mjs`](netlify/functions/refresh-social.mjs) triggers a rebuild
daily so the feed stays current. Adjust the cron in that file to taste.

Run `npm run feed` locally (with a `.env`) to fetch without a full build.

## Deploy (Netlify)

`netlify.toml` already configures everything:

- Build command `npm run build`, publish `dist/`, functions `netlify/functions/`.
- `/api/subscribe` → the function; 301s from the old URLs (`/blog*`, etc.).
- Security + cache headers.

Connect the repo to Netlify, set the `DATABASE_URL` env var, and deploy. Point the
`eduardluta.com` domain at the site (DNS is already on Netlify).

## Notes

- The **social wall** shows live Instagram + TikTok once tokens are set (see
  above); X / LinkedIn stay curated. Until tokens are configured it shows the
  curated fallback posts.
- The **Albanian** copy is a solid first pass — worth a native proofread before a
  wide launch.
