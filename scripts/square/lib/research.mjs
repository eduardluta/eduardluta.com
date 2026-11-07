// Per-coin catalyst research via Claude + server-side web search. Sequential, tolerant parsing.
import Anthropic from '@anthropic-ai/sdk';

const KEYS = ['symbol', 'headline', 'catalyst', 'confidence', 'events', 'sources'];

const system = (today) => `You are a crypto market research analyst. Today's date is ${today}.
You are given one Binance spot coin that rose over a specific 3-day UTC window. Use web search to find what actually drove THIS move in THIS window.

Look for: exchange listings, token unlocks or burns, mainnet or upgrade dates, funding rounds, partnerships, exchange or ETF news, regulatory decisions, earnings or macro prints, index inclusion, large on-chain or whale flows, or simply broad-market beta (if the whole market is up, say so: that is a legitimate finding).
Also report UPCOMING dated events in the next ~30 days (type "upcoming").
Correlate with equities or macro only where a real, documented link exists (a listed company holding that treasury asset, an ETF decision date, a CPI or FOMC print). Otherwise leave equityMacroLink empty.

HARD RULE: never invent a catalyst. If you find no specific, sourced driver, return confidence "none" and say the move looks like market beta or is unexplained. Fabricated causality is worse than "unclear".
Every claim needs a source URL and every event needs an ISO date (YYYY-MM-DD). Keep text concise and factual, no price targets, no trading advice.

Reply with ONE fenced \`\`\`json block and nothing else, shaped exactly:
{"symbol":"","headline":"","catalyst":"","confidence":"high|medium|low|none","events":[{"date":"YYYY-MM-DD","type":"past|upcoming","what":"","sourceUrl":""}],"marketContext":"","equityMacroLink":"","risks":"","sources":[{"title":"","url":""}]}`;

const user = (c) => {
  const d = c.days, f = (x) => `${x.date}: ${x.pct >= 0 ? '+' : ''}${x.pct.toFixed(2)}%`;
  return `Coin: ${c.base} (${c.symbol} on Binance spot)
Window (UTC): ${d.d2.date} to ${d.d0.date} (last day still in progress)
Daily moves: ${f(d.d2)}, ${f(d.d1)}, ${f(d.d0)}
Cumulative 3-day move: +${c.cum3dPct.toFixed(2)}%
24h quote volume: ${(c.quoteVolume24h / 1e6).toFixed(1)}M USDT, last price ${c.lastPrice}
Find the reason for this move and any upcoming dated events.`;
};

export function parseResult(text) {
  let raw = text.match(/```json\s*([\s\S]*?)```/i)?.[1];
  if (!raw) {
    const s = text.indexOf('{');
    if (s >= 0) {
      let depth = 0, inStr = false, esc = false;
      for (let i = s; i < text.length; i++) {
        const ch = text[i];
        if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
        if (ch === '"') inStr = true;
        else if (ch === '{') depth++;
        else if (ch === '}' && --depth === 0) { raw = text.slice(s, i + 1); break; }
      }
    }
  }
  if (!raw) return { parseError: 'no JSON found', rawText: text };
  try {
    const j = JSON.parse(raw);
    const missing = KEYS.filter((k) => !(k in j));
    if (missing.length) return { parseError: `missing keys: ${missing.join(',')}`, rawText: text };
    if (!['high', 'medium', 'low', 'none'].includes(j.confidence)) return { parseError: `bad confidence: ${j.confidence}`, rawText: text };
    return j;
  } catch (e) { return { parseError: e.message, rawText: text }; }
}

export async function research(candidates, { topN = 3, today = new Date().toISOString().slice(0, 10) } = {}) {
  const client = new Anthropic();
  const out = [];
  for (const c of candidates.slice(0, topN)) {
    console.error(`[research] ${c.symbol} ...`);
    const entry = { symbol: c.symbol, base: c.base };
    try {
      const stream = client.beta.messages.stream({
        model: 'claude-opus-5-5',
        max_tokens: 64000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        thinking: { type: 'adaptive' },
        output_config: { effort: 'high' },
        tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 8 }],
        system: system(today),
        messages: [{ role: 'user', content: user(c) }],
      });
      const res = await stream.finalMessage();
      if (res.stop_reason === 'refusal') {
        entry.refusal = { category: res.stop_details?.category, explanation: res.stop_details?.explanation };
        console.error(`[research] ${c.symbol} refused: ${entry.refusal.category}`);
        out.push(entry); continue;
      }
      const searchErrors = [];
      let text = '';
      for (const b of res.content) {
        if (b.type === 'text') text += b.text;
        else if (b.type === 'web_search_tool_result') {
          if (!Array.isArray(b.content)) searchErrors.push(b.content?.error_code ?? b.content?.type ?? 'unknown');
        }
      }
      if (searchErrors.length) entry.searchErrors = searchErrors;
      Object.assign(entry, parseResult(text));
      entry.symbol = c.symbol;
      console.error(`[research] ${c.symbol} -> ${entry.parseError ? 'parse error' : entry.confidence}`);
    } catch (e) {
      entry.error = e.message;
      console.error(`[research] ${c.symbol} failed: ${e.message}`);
    }
    out.push(entry);
  }
  return out;
}
