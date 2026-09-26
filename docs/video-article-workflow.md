# Video articles through the Codex desktop account

Prepared 23 September 2026. Eduard has given standing authorization to finish and publish video articles from start to finish after the checks below pass. The native hourly heartbeat **Publish new video articles** (automation ID `publish-new-video-articles`) is **ACTIVE** in this task. Tool creation and the saved `automation.toml` were verified. Pilot release `db62113` is successfully deployed on Railway. Both live language pages, 18 linked assets, indexability, canonicals, language alternates, structured data, sitemap and RSS were verified on 23 September 2026. Google Search Console submission is pending Google account sign-in; indexing is not confirmed.

## Account and model

Use Codex in the desktop app, signed in with Eduard's existing ChatGPT account. This uses the account's Codex allowance; it does not require a separately billed OpenAI API key. The work still needs an internet connection and is subject to account usage limits.

Requested model: **GPT-6 Astra (`gpt-6-astra`), High reasoning (`high`)**. The native `send_message_to_thread` tool accepted those settings for the initial workflow follow-up in this task. The heartbeat configuration has no model/reasoning fields, and persistent model inheritance for later heartbeat runs has not been verified. Do not describe every future run as guaranteed to use Astra High until that behavior is confirmed. A saved instruction naming a model cannot change runtime settings by itself. A standalone scheduled task, if Eduard later chooses one, should explicitly save the requested model and reasoning settings.

Keep the computer on, the desktop app running, and this project available. Do not promise work while the computer is asleep or the app is closed. Eduard requires missed work to catch up when the app is available again. The active hourly heartbeat resumes from durable state on its next available scheduled execution after reopening. An immediate app-open trigger has not been verified, and no supported control for enabling one has been established; do not promise that reopening the app starts the workflow immediately.

Codex uses its supported cached sign-in. Do not copy account cookies or OAuth tokens into this website, Railway, GitHub, or a custom API proxy. TikTok and Google sign-ins, when needed, are separate from the OpenAI account.

## Discover new videos without a TikTok API

The active native hourly heartbeat **Publish new video articles** checks the public `@eduardluta` TikTok profile in this task while the desktop workflow can run. Eduard can also paste a published video link into this task. A configured schedule does not establish that discovery or publication has already succeeded; record the results of actual runs separately.

Browser discovery is best effort: login prompts, unavailable posts, and CAPTCHA can interrupt it. Use the normal browser session. Stop and report an actionable source-access problem instead of bypassing access controls or treating the absence of accessible results as proof that no new videos exist.

For reliable article writing, retain the original local video or script alongside the post URL when available. A URL alone may not supply intelligible speech or a usable transcript. Expand verified meaning from the clip, caption, or creator notes; do not invent dialogue, personal experiences, product prices, or missing source material.

Track the platform video ID and article slug so repeated checks, deployment retries, and cross-posts cannot create duplicate articles. Inspect both local content and the live site before creating or publishing an entry. The existing pilot is published:

- TikTok ID: `7688677111879732501`
- Slug: `kosovo-germany-grocery-prices`
- Status: published and live-verified from release `db62113`.
- English: https://eduardluta.com/writing/kosovo-germany-grocery-prices/
- Albanian: https://eduardluta.com/sq/writing/kosovo-germany-grocery-prices/
- Search Console: pending Google sign-in. The usable TikTok fallback was verified; embedded playback has not been verified.

The initial discovery succeeded on 23 September 2026 at 17:05 UTC. The newest non-pinned video in the Latest listing was published at 14:26 UTC, before monitoring began at 16:58 UTC; no new eligible posts were waiting in that initial monitored period. The durable state records that evidence and the successful discovery watermark.

## Full archive authorization — 26 September 2026

Eduard explicitly requested articles for **all his videos**, expanding the earlier latest-20 scope. A complete public-profile scan found 132 posts: **119 videos and 13 photo-only posts**. Twenty-six videos already had published bilingual articles; **93 additional videos** were entered as explicit pending records in `work/video-article-state/state.json`, with `authorization: full-archive-request-2026-09-26`. The `fullArchive` object records the inventory and progress. The newest-to-oldest scan reached the end of the grid, and the oldest boundary was checked against the Oldest sort.

Complete every pending video through the same researched English/Albanian publication workflow. Historical dates do not exclude these explicitly authorized records. Resume them at each available run alongside new-video discovery; never equate inventory, asset retrieval, or transcription with completed articles. Keep the new-video discovery watermark separate from archive completion. Photo-only posts are recorded separately and are not silently treated as videos. Preserve existing articles and reconcile possible duplicate source material before drafting.

## Catch up after missed runs

Use the initialized, gitignored local file `work/video-article-state/state.json` as durable state, independently of the replaceable social-wall cache. Schema version 1 contains `monitoringStartedAt`, the last successful discovery watermark `lastCompleteDiscoveryAt`, and `videos` keyed by platform video ID. Each video record stores its URL, slug, status, and `articlePaths`; add verified retry/error, deployment, and live-URL details as work progresses. Write updates atomically by writing and validating a temporary file in the same directory, then replacing the state file. Never replace valid state with a partial or malformed write. Cross-posted copies of the same video must resolve to the existing article record.

At every available execution, first load unfinished/failed records for retry, then scan the entire period since `lastCompleteDiscoveryAt` with a 24-hour overlapping boundary, never earlier than `monitoringStartedAt` unless retrying an explicit pending item. When that field is null, use `monitoringStartedAt` as the starting boundary and include explicit pending records such as the pilot; do not bulk-publish the historical backlog. Paginate through the missed period; checking only the latest four posts is insufficient. Reconcile discovered IDs with existing records, article frontmatter video IDs, and live articles before creating anything. Frontmatter IDs provide a duplicate guard if local state is lost; reconstruct safely without treating all old posts as newly authorized work. This must recover all accessible new videos since monitoring began even if several checks were missed while the app or computer was unavailable.

Advance the discovery watermark only after the entire intended scan has completed successfully. Failed requests, login/CAPTCHA interruptions, inaccessible results, or partial pagination must not advance it or be treated as an empty successful scan. Persist verified per-video progress as it happens so a restart can resume safely, but do not mark a failed step, deployment, or article complete. Retry unfinished records even when they are older than the discovery watermark. A run that cannot finish must leave durable state that makes the remaining work visible to the next run.

The hourly native heartbeat is active. Catch-up runs on its next available scheduled execution after downtime. This is not a verified immediate app-open trigger. Preserve the durable state and retry rules regardless of when the scheduler next executes; scheduling activation is separate from successful discovery, publication, and Google indexing.

## Finish and publish each article

Follow `docs/eduard-digital-voice.md` and the editorial standard in `docs/video-to-article-proposal.md`. Use the Kosovo–Germany article as the quality example, not as a requirement that every video have an economics angle.

1. Identify what the video says and the intended takeaway. Separate creator claims from independently verified facts.
2. Research the questions that make the article useful. Use current primary sources, record dates and units, calculate comparisons with reproducible inputs, and state material limitations.
3. Write complete English and Albanian Markdown articles under the same slug, preserving Eduard's voice. Do not deliver empty sections, an outline, or guessed facts disguised as completed research.
4. Include the original durable thumbnail, the platform video, useful charts and factual visuals, descriptive alt text, and meaningful captions. Verify that the article shows a relevant image in both Writing lists and the homepage list when featured, not a letter placeholder. The list uses a prepared thumbnail when present, then the article's hero image, video poster, or first body image. Use readable desktop/mobile chart layouts. Put source and calculation notes in the compact, visible `.article-notes` section.
5. Add a focused title, natural description, standfirst, shared tags, and accurate available video metadata. Keep important explanations, numbers, source links, and conclusions in readable HTML, not solely inside images or the video.
6. Check math, both translations, factual support, source dates, asset links, embed/fallback behavior, rendered metadata, mobile layout, and the site build. Resolve any failures before publishing. Keep incomplete work as `draft: true`; a passing article proceeds to publication under Eduard's standing authorization without a review handoff or another permission request.
7. Inspect the working tree and diff before committing. Commit only changes owned by this article/workflow, staging explicit paths or isolated hunks. Preserve Eduard's edits and unrelated changes; never use a broad stage, reset, or overwrite to make the tree convenient. If a shared file contains user edits, keep them intact and isolate the workflow changes before committing. Update the existing article/video record on retries instead of creating a duplicate.
8. Set the real publication/update dates and publish through the existing Git → Railway workflow. Verify the successful deployment and the live checks below before marking the article published or reporting completion. A successful local build or push alone is not completion.
9. Return the live English and Albanian URLs with a concise account of the completed checks and any separate search-submission status. Keep the source files editable for later changes. Stay quiet when there is no new actionable material; notify only about verified publication, meaningful failure, or required user action.

## Publication and Google

Publication is already authorized once the complete article passes its checks. Do not stop at a preview or ask Eduard to approve an otherwise finished article. Missing essential evidence, a failed check, or an actual access problem is a reason to preserve progress and report the specific blocker; an optional editorial review is not a publication gate.

After deployment, fetch both live EN/SQ article URLs and verify HTTP 200, the intended content and assets, self-canonicals, reciprocal language alternates, BlogPosting/BreadcrumbList metadata, useful internal links, indexable text, and a sitemap entry. Check that neither the page's robots metadata nor its response headers apply `noindex`, and that the intended canonical routes are not blocked by robots.txt. Verify the live video player or its usable fallback. The site already generates the core search elements, but inspect their deployed output. VideoObject can describe the source video when the necessary facts are verified. Only then record the published URLs and completed status.

Submit `https://eduardluta.com/sitemap-index.xml` in a verified Google Search Console property. This can be done through its browser interface without a Google API integration. For the first article, use URL Inspection and Request indexing on the live canonical URL. Check the result when a later run is authorized and available; submission is a request for discovery/crawling, not proof of indexing. If Search Console access is unavailable, report that specific pending step separately from the verified website publication. Do not claim that Google has indexed the article without evidence.

If a Google API is acceptable later, the Search Console Sitemaps API can submit the sitemap after deployment. Its URL Inspection API reports indexed status; it does not offer the UI's Request indexing action. Google's Indexing API does not support ordinary blog articles: its documented scope is JobPosting and livestream BroadcastEvent pages. Do not use obsolete sitemap-ping URLs or promise guaranteed indexing/rankings.

The current page is primarily an article with a supporting video. Google can index the article without indexing its video. The click-to-load player is a separate video-discovery limitation: Google says not to rely on clicking to load a video. Dedicated video search would require a further design decision, such as a crawlable watch page with a prominent rendered player. Structured data alone does not settle eligibility. Preserve the approved article/player presentation until that change is deliberately made.

## Operating instructions for the active recurring run

Check for newly published videos from Eduard Luta and complete their researched bilingual articles through live publication. Follow `docs/video-article-workflow.md`, `docs/video-to-article-proposal.md`, and `docs/eduard-digital-voice.md`. Use the Kosovo–Germany article as the quality reference. Inspect existing video IDs, article files, and live URLs before creating anything; do not recreate the pilot, duplicate cross-posted videos, or overwrite Eduard's edits. For each new video, establish its meaning from available source material, do the needed primary-source research and calculations, make useful mobile-readable charts, retain the real thumbnail and platform link, add accurate SEO metadata, and finish both articles with compact source notes. Validate the content, translations, arithmetic, assets, metadata, mobile rendering, and build. Eduard has already authorized publication after these checks: commit only workflow-owned changes while preserving all unrelated/user edits, publish through the existing Git/Railway workflow, and verify live URLs, content, assets, canonical/language metadata, sitemap inclusion, and indexability before marking the item complete. Return the live EN/SQ URLs; do not stop at a draft or request another editorial approval. If essential source access or a required check is blocked, preserve useful progress and report the concrete missing input or failure instead of fabricating or publishing incomplete content. Record Search Console submission separately and never equate it with confirmed indexing. Stay quiet when nothing has changed. Notify only for verified publication, meaningful failure, or required user action.

At the start of every run, load the gitignored `work/video-article-state/state.json` file and its `lastCompleteDiscoveryAt` watermark and per-video state. If the watermark is null, start from `monitoringStartedAt` plus explicit pending records; do not bulk-publish old posts. Retry unfinished records and scan the whole missed period with overlapping boundaries and full pagination, including after the app/computer was unavailable. Deduplicate by video identity, article frontmatter IDs, and existing live articles, even if local state must be reconstructed. Advance the discovery watermark only after a complete successful scan; failures, inaccessible results, and partial pages must leave it unchanged. Write state atomically through a validated temporary file in the same directory. Save verified progress without marking incomplete work published. Resume this catch-up work on the next available scheduled execution after the app reopens; do not claim an immediate app-open trigger.

## Official references

- [OpenAI authentication](https://learn.chatgpt.com/docs/auth)
- [Local scheduled tasks and model selection](https://learn.chatgpt.com/docs/automations?surface=app)
- [Astra and reasoning controls](https://learn.chatgpt.com/docs/models)
- [Google: ask to recrawl URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Indexing API scope](https://developers.google.com/search/apis/indexing-api/v3/using-api)
- [Google video best practices](https://developers.google.com/search/docs/appearance/video)
