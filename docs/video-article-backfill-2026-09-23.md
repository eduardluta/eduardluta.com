# Latest-ten video article backfill — 23 September 2026

Requested explicitly by Eduard in the existing publishing task. Selection uses the latest ten actual videos on the public TikTok profile at discovery, ordered by their original publication timestamps. Photo posts and older pinned posts are excluded. The published Kosovo–Germany grocery article is retained as one of the ten; nine new articles are supplied in English and Albanian.

## Publication set

| Original video | Article slug |
| --- | --- |
| 7688736975846870292 · 2026-09-23 | `hamburg-camper-city-connections` |
| 7688677111879732501 · 2026-09-23 | `kosovo-germany-grocery-prices` |
| 7688468255735926036 · 2026-09-22 | `albanians-in-germany-beyond-the-numbers` |
| 7688402362620267797 · 2026-09-22 | `playfulness-without-losing-responsibility` |
| 7688347056766749973 · 2026-09-22 | `criticism-without-losing-yourself` |
| 7687941469189229844 · 2026-09-21 | `kosovo-switzerland-childs-idea-of-home` |
| 7687714978979269909 · 2026-09-20 | `swiss-museum-transport-family-visit` |
| 7687631563982441749 · 2026-09-20 | `kosovo-speed-cameras-road-safety` |
| 7687302231166586133 · 2026-09-19 | `love-making-room-for-your-child` |
| 7686930095969242388 · 2026-09-18 | `teaching-children-responsibility-with-support` |

## Evidence and assets

- Every new article retains its original public video URL, publication timestamp, duration and unaltered local thumbnail. Raw platform responses, temporary signed media URLs, audio and approximate local transcripts remain gitignored. Unclear speech is not published as a quotation.
- Nine bilingual article pairs add 19 original charts/diagrams, each with English/Albanian and desktop/mobile SVG variants (76 assets), plus nine original poster JPEGs. Regenerate diagrams with `python3 scripts/generate-video-backfill-visuals.py`.
- Four quantitative articles publish `source-data.json`: Hamburg fares, German citizenship statistics, museum ticket scenarios, and Kosovo road safety/pay scenarios. Sources, dates, definitions and assumptions are linked in the articles. Personal reflections use explicitly qualitative illustrations.
- Kosovo citizenship is not presented as Albanian ethnicity. No unverified diaspora total, relationship total, critic-motive statistic, medical outcome or family biography is invented. The speed-camera salary aspiration is tested as a hypothetical budget rather than asserted as a funded policy.

## Pre-publication checks

- `astro check`: zero errors or warnings, four existing hints. `astro build`: passed.
- All 18 rendered pages checked for one H1, original video IDs/dates, BlogPosting and VideoObject, self-canonical, language alternates, indexability, sitemap and RSS inclusion.
- Bilingual pairing, source-note sections, image paths, internal links, calculation results and all SVG text bounds verified. Desktop English and mobile Albanian pages inspected visually; source notes remain 13px and the mobile page has no horizontal overflow.
- Live release details belong in the durable local publishing ledger after deployment verification. Google Search Console remains a separate sign-in/submission step; inclusion in the sitemap is not a claim of indexing.
