# Video-to-article publishing proposal

Prepared 23 September 2026. Updated to reflect Eduard's standing instruction to complete and publish every video article from start to finish after full checks. The Kosovo–Germany pilot is publishing in progress: its bilingual content, charts, original thumbnail, and player are complete locally, but published status requires verified live deployment. No recurring discovery or publishing schedule is active yet.

## Editorial standard confirmed by Eduard

Every video article must be completed, researched, checked, and published directly. Eduard has authorized this full workflow; a separate editorial review or permission request is not required after the checks pass. Do the research, comparisons, arithmetic, chart creation, bilingual writing, deployment, and live verification before reporting completion; an outline, unfinished draft, or preview-only handoff is not sufficient. Keep the source files editable for later changes, and preserve any edits Eduard has already made. Include the real video thumbnail and embedded player, then use as many useful charts and factual visuals as the material supports. Keep source dates, units, assumptions, and calculation inputs available. Do not invent unavailable facts or turn an uncertain video statement into a verified statistic.

Use compact, visible footnote styling for sources and calculations (`.article-notes`), keeping the main article's reading size unchanged. The selected operating direction is a local Codex account workflow using GPT-6 Astra (`gpt-6-astra`) with High reasoning (`high`), without a separate OpenAI API key. See `docs/video-article-workflow.md` for the current setup plan, source access, full publishing workflow, and supported Google submission steps. This preference does not switch runtime settings or activate a recurring schedule by itself.

The pilot is `src/content/writing/{en,sq}/kosovo-germany-grocery-prices.md`, with four responsive charts in both languages, a product price table, linked primary sources, and downloadable calculation data. Edit those Markdown files directly while preserving existing user changes. Update numeric inputs in `scripts/data/kosovo-price-comparison.json` and regenerate chart assets with `uv run scripts/generate-kosovo-price-charts.py`. Keep the prose and displayed numbers aligned when inputs change. Its current workflow status is **publishing in progress**. Clear draft status when checks pass, and mark it published only after verifying both live language URLs and indexability.

## Recommendation

Give every distinct video a permanent article in the existing Writing section. Preserve Eduard's voice and the meaning of the video, then add the explanation, original images, references, and evidence that the short format could not contain. Use one article for the same video cross-posted to multiple platforms.

Keep `/writing/<slug>/` for English and `/sq/writing/<slug>/` for Albanian. Produce both versions under the same slug, following the site's standing bilingual content rule.

Publish each complete article as soon as the content, translation, arithmetic, visual, metadata, and build checks pass. This is Eduard's standing authorization, including the pilot. Hold a case only when essential evidence is missing, access is blocked, or a required check fails; preserve the work and identify the concrete blocker. A further review handoff is not a required step.

## Reader experience

Keep the existing warm paper, pine accent, IBM Plex Mono navigation, and IBM Plex Serif article typography.

1. A descriptive title, short introduction, author, publication date, reading time, and video duration where useful. The pilot uses the site's existing title, introduction, and date presentation.
2. The original TikTok embed near the opening: the pilot places a centered portrait player with its real thumbnail directly after the introduction. Preserve native controls and an “Open on TikTok” link. Load the third-party player on reader interaction and retain the thumbnail/link if it is unavailable.
3. The actual point of the video, in Eduard's voice, grounded in a transcript and any creator notes.
4. Context and explanation, with research only where it helps the reader understand the point. Separate personal experience, interpretation, and externally verifiable claims.
5. Useful images: original video stills, photographs, receipts, screenshots, diagrams, or sourced charts. Captions explain what each image establishes; factual visuals retain source and usage-rights information. Generated illustrations must not serve as evidence.
6. A closing takeaway and source notes; relevant existing writing and a transcript only where they are useful and reliable. The pilot does not reproduce the noisy automatic transcript.

Length follows the material: a short observation may need only a concise note; a substantial topic may justify a full essay. Do not stretch every clip into the same word count or add unnecessary FAQs. This follows `docs/eduard-digital-voice.md`.

Writing entries receive a subtle video label. Social cards gain “Read the full story” when the article is available, while retaining a link to the native social post. New articles use the existing homepage, RSS, sitemap, canonical, and language-alternate machinery.

## Pilot: publishing in progress

The live social feed currently includes a TikTok caption about prices and salaries in Kosovo. A suitable editorial direction is:

- Working title: **The math isn't mathing: prices and wages in Kosovo**.
- Opening: the question of affordability behind the video.
- Video: the original TikTok, close to the introduction.
- Context: compare the same products, quantities, dates, and currency; distinguish net/gross and average/median earnings.
- Evidence: dated official wage statistics, documented prices, and original product photos or receipts.
- Visual: explain a purchase as a share of comparable monthly income.
- Ending: the actual takeaway established from the transcript or creator note.

The original visual proposal has now been replaced by a full local article. The original thumbnail and caption were retrieved from TikTok's public metadata; locally transcribed audio supports the Germany/ALDI setting but is too noisy for verbatim quotation. The added research therefore compares four explicitly selected staple categories, independently of the exact products in the clip. Official Kosovo prices total €4.89 versus €3.92 at ALDI Nord; the 24.7% shelf premium becomes 5.42 times the share of published average net wages. Different price dates, product specifications, retail samples, and national wage methods are disclosed in the article. Neither the caption's threefold price claim nor a countrywide cost-of-living ratio is asserted as a finding.

## Publishing workflow

**Video source and intent → published social URL → verified meaning/transcript → researched bilingual article and images → full validation → publication → website deployment → verified live URLs and indexability.**

The best input is the original video file or script, plus an optional sentence such as “The point I wanted people to understand was…”. Keep source links and original photos alongside it. Preparing this before social publication is the most reliable way to preserve intent; add the final TikTok URL when the post goes live.

The selected starting direction is the local account workflow described in `docs/video-article-workflow.md`: discover public posts through the normal browser session or receive their URLs in the task. No recurring cadence is active yet. A separate Display API worker remains an optional future discovery implementation if the existing integration's credentials and permissions are verified. Such a worker would paginate beyond the latest four videos and respect API visibility/availability. A supported publication callback from an existing scheduling tool could replace polling after that integration is verified. Whichever route is used, inspect stored video IDs, article files, and live URLs before creating content; record processed IDs and retry failures without duplicating the pilot, a new video, or the same video cross-posted elsewhere.

TikTok's documented publishing webhooks concern content sent through its publishing APIs; do not assume they announce every ordinary in-app post. The standard video metadata does not provide a transcript, so the source file/script remains necessary for faithful expansion.

Use durable records for source video, full caption, transcript, creator notes, source references, original assets, article slug, languages, processing status, deployment, and verified live URLs. Suggested statuses: discovered, awaiting-source, drafting, validating, publishing, published, failed. Keep this archive separate from the replaceable social-wall cache. `Published` requires completed live verification; a local build, commit, push, or pending deployment alone is insufficient.

Eduard also requires catch-up after the app or computer was unavailable. The initialized, gitignored local file `work/video-article-state/state.json` stores schema version 1, `monitoringStartedAt`, the last successful discovery watermark `lastCompleteDiscoveryAt`, and `videos` keyed by platform ID with URL, slug, status, and article paths. Write state atomically through a validated temporary file in the same directory. Every available run must retry unfinished items and scan the complete missed period with overlap and full pagination. When `lastCompleteDiscoveryAt` is null, begin at `monitoringStartedAt` plus explicit pending records; do not bulk-publish old posts. Deduplicate against stored IDs, article frontmatter video IDs, and live articles; frontmatter remains a duplicate guard if state is lost. Advance the watermark only after a fully successful scan; failed requests, blocked access, and partial results must not move it forward. Record verified progress durably, but never mark failed or unfinished publication complete. Older unfinished records remain eligible for retry after a later successful discovery scan. An hourly native run is the intended starting cadence if supported and activated; immediate native app-open triggering is still being investigated and must not be promised. Catch-up must run on the next available execution after reopening, and no recurring schedule is active until confirmed by the scheduling tool.

Generate Markdown using the existing voice guide. Validate quotes and factual claims against the source material, verify research links, retain image credits, check both translations and calculations, inspect desktop/mobile rendering and metadata, check the embed or usable fallback, and run the site build. Once these checks pass, publication proceeds under standing authorization through the existing Git → Railway workflow.

Inspect the working tree and diff before committing. Stage only explicit workflow-owned paths or isolated hunks. Preserve unrelated work and all user edits; never overwrite, reset, or broadly stage them as part of an article run. If a shared file contains user changes, keep those changes intact and isolate the workflow changes before committing. Retries update the existing article and processing record.

Track deployment success, then verify both live language URLs return HTTP 200 and show the intended article and assets. Check self-canonicals, reciprocal language alternates, structured metadata, sitemap inclusion, crawlable text, and the absence of unintended `noindex` metadata/headers or robots.txt blocking. Verify the live player or fallback before marking the article published. Return the live EN/SQ URLs after these checks. Errors retain useful work and a concrete retryable failure instead of publishing partial content or claiming completion. Record Search Console submission separately: a request for indexing is not proof of indexing.

If an external video is removed, retain the useful article and transcript with an unavailable-video notice. A separately hosted copy is an optional future capability requiring the original file and appropriate media rights.

## Implementation status

| Area | Current state | Proposed change |
|---|---|---|
| Articles | Astro Markdown collection, bilingual routes; optional video metadata now implemented | Complete bilingual pilot is publishing in progress |
| Article rendering | Reusable portrait TikTok component and thumbnail fallback now implemented | Playback depends on TikTok availability; preview fallback verified |
| TikTok discovery | Build-time fetch of four posts; short captions | Separate durable ingestion, pagination, deduplication |
| Scheduling | Daily redeploy workflow exists; activation depends on a configured secret; no recurring article workflow is active | Activate a selected local cadence separately; a dedicated API worker is an optional future route |
| Assets | Pilot has durable original thumbnail and responsive EN/SQ chart assets | Extend this durable asset pattern to later articles |
| Publishing | Git content and Railway build; standing authorization to publish after full checks | Validate, commit only workflow-owned changes, deploy, and verify live URLs/indexability before completion |
| Search metadata | BlogPosting, canonical, language alternates; optional linked VideoObject now implemented | Include verified source metadata on future videos; drafts remain noindex |
| Production security policy | Local code permits the exact TikTok iframe host | Verify deployed policy as part of the publication in progress |

Relevant files: `src/content.config.ts`, `src/components/views/ArticleView.astro`, `src/lib/schema.ts`, `scripts/fetch-social.mjs`, `.github/workflows/refresh-tiktok.yml`, and `server.mjs`.

The repository has existing TikTok authentication and token persistence code, and the public website displays TikTok posts. This review did not inspect secrets, test token validity, or confirm deployed API permissions. No new CMS is needed for the pilot.

## Rollout

1. **Pilot article — publishing in progress:** real thumbnail and player integration, researched article, citations, checked arithmetic, four responsive charts, and English/Albanian copy are complete locally. Finish deployment and verify the live EN/SQ URLs and indexability before marking it published.
2. **Reusable format — partly implemented:** article metadata, embed component, styles, required frame policy, and optional VideoObject markup are in place. Archive video labels and social-to-article links remain future work.
3. **Automation — not active yet:** durable discovery and processing, complete bilingual generation, validation, publication, and live verification. A configured recurring run must use the standing full-publishing instruction, catch up all missed discovery periods and unfinished items after downtime, and avoid duplicate videos; it must not introduce another editorial approval gate. Verify supported scheduling/app-open behavior before claiming activation. Refine the voice using Eduard's later edits without overwriting them.

## Primary references

- [TikTok embedding](https://developers.tiktok.com/docs/en/embed-videos): official embeds and availability behavior.
- [TikTok embed player](https://developers.tiktok.com/docs/en/embed-player): iframe player integration.
- [TikTok List Videos](https://developers.tiktok.com/docs/en/tiktok-api-v2-video-list): authorized discovery of public videos.
- [TikTok Display API setup](https://developers.tiktok.com/docs/en/display-api-get-started): app approval and authorization requirements.
- [TikTok Video Object](https://developers.tiktok.com/docs/en/tiktok-api-v2-video-object): available metadata fields; absence of a transcript field is the basis for requiring a separate transcript source.
- [TikTok publishing status and webhooks](https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status): callbacks for content uploaded through the publishing API.
- [Google video guidance](https://developers.google.com/search/docs/appearance/video): embedding a video in an article does not by itself qualify the page for video search features. A watch page has different requirements. No ranking or rich-result outcome is guaranteed.
