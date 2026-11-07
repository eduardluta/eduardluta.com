# binance-square-pulse

Finds liquid Binance USDT spot coins that are up two closed UTC days plus a positive current day, researches why (Claude + web search, dated and sourced), screenshots their real Binance charts, and writes a draft Square post. Publishing is a separate, manual command. Standalone: not part of the Astro build, own `package.json` and `node_modules`.

## Install

```
cd scripts/square && npm install
cp .env.example .env   # fill in keys
```

Chromium comes from the Playwright cache (`~/Library/Caches/ms-playwright`). Only run `npx playwright install chromium` if it is missing.

## Commands

```
npm run scan                      # print movers, no side effects beyond runs/scan-latest.json
npm run run                       # scan -> research -> shots -> compose into runs/<id>/
npm run run -- --skip-research --skip-shots   # cheap local test
npm run publish -- --run runs/<id> --confirm  # manual, after review
npm run publish -- --dry-run --confirm        # preview payload, no network
```

Flags (scan and run):

| Flag | Default | Meaning |
|---|---|---|
| `--min-volume` | 5000000 | min 24h quote volume (USDT); keeps microcap pumps out |
| `--min-day-pct` | 1.0 | min % for each of the two closed days |
| `--min-today-pct` | 0.2 | min % for the in-progress day |
| `--prefilter` | 80 | candidates (by 24h change) to fetch klines for |
| `--top` | 3 | coins to research, screenshot and post |

`run` only: `--skip-research`, `--skip-shots`, `--dry-run` (default; run never publishes at all).
`publish` only: `--run <dir>` (default `runs/latest`), `--confirm`, `--dry-run`.

A quiet market can legitimately return zero candidates at the defaults. Loosen the flags rather than the quality gates.

## Review then publish

1. `npm run run`. Output ends with the path to `draft.md` and the exact publish command.
2. Read `draft.md`: post text, daily numbers, research JSON with source links, screenshot paths. Edit `post.json` if needed. Do not publish a draft whose catalyst lines say "not verified".
3. Run the printed publish command. Guards: needs `SQUARE_OPENAPI_KEY`, `--confirm`, a run dir with `post.json`, and a runId not already `published` or `unknown` in `state/published.json`.

Posts carry `$TICKER` cashtags (Write-to-Earn pays on cashtag-driven trading fees), no links, no price targets, under 900 characters.

## Square OpenAPI key

Generate it in Square Creator Center: https://www.binance.com/square/creator-center/home. It is a separate, publish-only, KYC-gated credential, NOT an exchange API key.

Limits: 100 posts/day, 400 image uploads/day (max 4 images per post here). Errors mapped: 220003 key not found, 220004 expired, 220009 post cap, 220014 upload cap, 20002/20022 sensitive words, 20013 too long, 30008/2000001/2000002 account or device restriction.

## The 504 gotcha

`/content/add` can return HTTP 504 after the post actually succeeded. It is never retried. On a 504 or any ambiguous failure the run is recorded as `unknown`, a loud message prints, and re-publish is refused until you check your Square profile and edit `state/published.json` yourself. The image endpoints are an undocumented gateway: request/response shapes are logged to stderr and parsed defensively, so expect to adjust `uploadImage` if Binance changes them.

## Moving to Railway cron later

It is a standalone package, so it drops into a daily-report-style service with its own `railway.json` (install Playwright chromium in the build, set `ANTHROPIC_API_KEY`). Cron runs only `run.mjs`; the publish step stays manual.
