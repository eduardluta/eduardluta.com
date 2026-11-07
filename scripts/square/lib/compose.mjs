// Builds the Square post payload (<900 chars) and the human review draft.
const MAX = 900;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dshort = (iso) => `${MON[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`;
const pc = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
const clean = (s = '') => String(s).replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
const ISO = /^\d{4}-\d{2}-\d{2}$/;

// Whole sentences only, never a mid-sentence cut. Returns '' if even the first one is too long.
function sentences(text, maxLen) {
  const parts = clean(text).match(/[^.!?]+[.!?]+(\s|$)/g)?.map((s) => s.trim()) ?? [];
  let out = '';
  for (const s of parts.slice(0, 2)) {
    const next = out ? out + ' ' + s : s;
    if (next.length > maxLen) break;
    out = next;
  }
  return out;
}

const nextEvents = (r) => (r?.events ?? [])
  .filter((e) => e?.type === 'upcoming' && ISO.test(e.date ?? '') && e.what)
  .sort((a, b) => a.date.localeCompare(b.date));

function catalystLine(r, maxLen) {
  if (!r || r.parseError || r.refusal || r.error) return 'Catalyst not verified.';
  if (r.confidence === 'none') return 'No clear catalyst found; looks like broad market moves or unexplained.';
  const past = (r.events ?? []).filter((e) => e?.type === 'past' && ISO.test(e.date ?? '') && e.what)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  let s = sentences(r.catalyst, maxLen);
  if (!s && past) s = sentences(`${clean(past.what).replace(/[.!?]+$/, '')}.`, maxLen);
  if (!s) return 'No clear catalyst found.';
  if (past && !s.includes(dshort(past.date)) && (s + ` (${dshort(past.date)})`).length <= maxLen) s += ` (${dshort(past.date)})`;
  return s;
}

function render(coins, researchBy, catMax, withNext) {
  const lines = [`3-day movers on Binance: ${coins.map((c) => `$${c.base} ${pc(c.cum3dPct)}`).join(', ')}.`, ''];
  for (const c of coins) {
    const d = c.days;
    lines.push(`$${c.base}: ${dshort(d.d2.date)} ${pc(d.d2.pct)}, ${dshort(d.d1.date)} ${pc(d.d1.pct)}, ${dshort(d.d0.date)} ${pc(d.d0.pct)} (so far). 3-day ${pc(c.cum3dPct)}.`);
    lines.push(catalystLine(researchBy.get(c.symbol), catMax), '');
  }
  if (withNext) {
    const ev = coins.flatMap((c) => nextEvents(researchBy.get(c.symbol)).slice(0, 1)
      .map((e) => `$${c.base} ${dshort(e.date)} ${clean(e.what).slice(0, 60)}`));
    if (ev.length) lines.push(`What's next: ${ev.join('; ')}.`, '');
  }
  lines.push('Market commentary, not financial advice. I may hold positions in these assets.');
  return lines.join('\n');
}

// Drop coins before shrinking detail; never cut mid-sentence.
export function composePost(candidates, research, topN = 3) {
  const researchBy = new Map((research ?? []).map((r) => [r.symbol, r]));
  const pool = candidates.slice(0, topN);
  for (const [catMax, withNext] of [[170, true], [110, true], [110, false], [70, false]]) {
    for (let n = pool.length; n >= 1; n--) {
      const content = render(pool.slice(0, n), researchBy, catMax, withNext);
      if (content.length < MAX) return { content, coins: pool.slice(0, n).map((c) => c.symbol) };
    }
  }
  throw new Error(`Could not fit post under ${MAX} chars`);
}

export function compose({ scan, research, shots, opts = {} }) {
  const { content, coins } = composePost(scan.candidates, research, opts.top ?? 3);
  if (content.length >= MAX) throw new Error(`content ${content.length} chars >= ${MAX}`);
  const post = { contentType: 1, content, imageList: [] };
  const rb = new Map((research ?? []).map((r) => [r.symbol, r]));
  const sb = new Map((shots ?? []).map((s) => [s.symbol, s]));
  const used = scan.candidates.filter((c) => coins.includes(c.symbol));
  const md = [`# Binance Square draft ${scan.generatedAt}`, '', `${content.length} / ${MAX} chars. Coins in post: ${coins.join(', ')}.`, '',
    '## Post text', '', '```', content, '```', '', '## Daily numbers (UTC)', '',
    '| Symbol | D-2 | D-1 | Today | 3-day | 24h vol (M USDT) |', '|---|---|---|---|---|---|',
    ...used.map((c) => `| ${c.symbol} | ${c.days.d2.date} ${pc(c.days.d2.pct)} | ${c.days.d1.date} ${pc(c.days.d1.pct)} | ${c.days.d0.date} ${pc(c.days.d0.pct)} | ${pc(c.cum3dPct)} | ${(c.quoteVolume24h / 1e6).toFixed(1)} |`), ''];
  md.push('## Research', '');
  if (!research?.length) md.push('_No research in this run (skipped). The post says "Catalyst not verified" for each coin; do not publish it as is._', '');
  for (const c of used) {
    const r = rb.get(c.symbol);
    if (!r) continue;
    md.push(`### ${c.symbol}`, '');
    if (r.parseError || r.refusal || r.error) { md.push('```json', JSON.stringify(r, null, 2), '```', ''); continue; }
    md.push(`**${r.headline}** (confidence: ${r.confidence})`, '', `Catalyst: ${r.catalyst}`, '');
    if (r.events?.length) md.push('Events:', ...r.events.map((e) => `- ${e.date} [${e.type}] ${e.what}${e.sourceUrl ? ` ([source](${e.sourceUrl}))` : ''}`), '');
    if (r.marketContext) md.push(`Market context: ${r.marketContext}`, '');
    if (r.equityMacroLink) md.push(`Equity/macro link: ${r.equityMacroLink}`, '');
    if (r.risks) md.push(`Risks: ${r.risks}`, '');
    if (r.sources?.length) md.push('Sources:', ...r.sources.map((s) => `- [${s.title || s.url}](${s.url})`), '');
    md.push('<details><summary>Full research JSON</summary>', '', '```json', JSON.stringify(r, null, 2), '```', '', '</details>', '');
  }
  md.push('## Screenshots', '');
  if (!shots?.length) md.push('_None (skipped)._');
  for (const c of used) {
    const s = sb.get(c.symbol);
    if (s) md.push(`- ${s.file} (${s.mode ?? 'failed'}, ${s.bytes} bytes)${s.error ? ' ERROR: ' + s.error : ''}`);
  }
  md.push('', '## Publish (manual, after review)', '', '```', opts.publishCmd ?? 'npm run publish -- --confirm', '```', '');
  return { post, markdown: md.join('\n') };
}
