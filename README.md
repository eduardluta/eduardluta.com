# eduardluta.com

Personal website of Eduard Luta — a lean, bilingual (English ⇄ Albanian) static
site: bio, writing with a full article reader, projects, principles, a social
wall, and a newsletter capture. Monospace, warm paper / warm‑charcoal themes,
one pine accent.

Built with **[Astro](https://astro.build)** and deployed on **Railway** as a Node
server (Express wrapping the Astro handler). No CMS — content lives natively in
the repo as Markdown + typed data, pre‑rendered to static HTML for best‑in‑class SEO.

## Tech

- **Astro 5** — prerendered pages + one on‑demand API route, per‑page URLs, view transitions.
- **Server** — `@astrojs/node` (middleware mode) behind [`server.mjs`](server.mjs)
  (Express): security headers, legacy 301s, static + asset caching.
- **i18n** — English at the root (`/`), Albanian under `/sq/`, cross‑linked with
  `hreflang`. Content collections carry both languages.
- **SEO** — per‑page title/description, canonical, `hreflang` (incl. `x-default`),
  Open Graph + Twitter cards, JSON‑LD (`Person`, `WebSite`, `BlogPosting`,
  `BreadcrumbList`), `sitemap-index.xml`, `robots.txt`.
- **Fonts** — IBM Plex Mono, self‑hosted via `@fontsource` (no CLS, no third party).
- **Newsletter** — Astro API route (`/api/subscribe/`) → Railway Postgres.

## Develop

```bash
npm install
npm run dev        # local dev server (http://localhost:4321)
npm run build      # production build → dist/
npm run preview    # serve the built dist/ locally
npm run assets     # regenerate favicons + OG image (public/*.png)
```

Node 22 is pinned (`.nvmrc`, `package.json` `engines`, `railway.json`).

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
src/pages/api/subscribe.ts             # newsletter API → Railway Postgres
server.mjs                             # Express wrapper: headers, redirects, static
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

## Newsletter → Railway Postgres

The signup popup POSTs to `/api/subscribe/`, an Astro API route
([`src/pages/api/subscribe.ts`](src/pages/api/subscribe.ts)) that inserts into the
Railway Postgres database. Same project as the app, so:

1. In your Railway project, add a **Postgres** service.
2. On the app service, set `DATABASE_URL = ${{ Postgres.DATABASE_URL }}` (the
   internal reference — private network, no TLS, faster). Redeploy.
3. *(Optional)* apply [`db/schema.sql`](db/schema.sql); the route also creates the
   `subscribers` table on first call.

The route reads `DATABASE_URL` at runtime; it is never committed. Locally, copy
`.env.example` to `.env` (use the Postgres *public* URL) and run `npm start`.

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
4. Set `INSTAGRAM_TOKEN` (and optionally `INSTAGRAM_USER_ID`) in the Railway service.
   ⚠️ Long-lived tokens expire ~60 days — refresh it before then.

**TikTok** (access tokens expire in ~24h, so we use the refresh-token flow):
1. Create an app at [developers.tiktok.com](https://developers.tiktok.com), add **Login Kit**, and request the `user.info.basic` + `video.list` scopes.
2. Register a redirect URI (e.g. `https://eduardluta.com/`).
3. Put `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI` in `.env`, then run:
   ```
   npm run tiktok:auth                 # prints an authorize URL — open + approve
   npm run tiktok:auth "<redirected URL>"   # exchanges the code, saves the refresh token
   ```
4. Set `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REFRESH_TOKEN` in Railway.
   The build mints a fresh access token each time and persists the rotated refresh
   token in Postgres (so it keeps working). The refresh token lasts ~365 days.

**Keeping it fresh:** the feed is fetched at build time, so it refreshes on every
deploy. For automatic daily refresh, add a scheduled redeploy on Railway (a cron
service that triggers a redeploy via the Railway API) — a small follow-up.

Run `npm run feed` locally (with a `.env`) to fetch without a full build.

## Deploy (Railway)

[`railway.json`](railway.json) configures the build/start; Railway (Nixpacks) runs
`npm run build` then `npm start` ([`server.mjs`](server.mjs)), reading `PORT` from
the environment.

1. Create a Railway **project** and deploy this repo (add the service from GitHub).
2. Add a **Postgres** service in the same project.
3. On the app service → **Variables**, set:
   - `DATABASE_URL = ${{ Postgres.DATABASE_URL }}`
   - `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REFRESH_TOKEN`
4. Add the **custom domain** `eduardluta.com` on the app service and point DNS at
   the target Railway gives you (CNAME/A). Railway provisions HTTPS automatically.

Redirects, security headers, and asset caching are handled in `server.mjs`.

## Notes

- The **social wall** shows live Instagram + TikTok once tokens are set (see
  above); X / LinkedIn stay curated. Until tokens are configured it shows the
  curated fallback posts.
- The **Albanian** copy is a solid first pass — worth a native proofread before a
  wide launch.
