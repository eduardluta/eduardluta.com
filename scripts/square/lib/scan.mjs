// Finds liquid USDT spot coins up 2 closed UTC days plus a positive current day.
import { listUsdtSpotSymbols, fetch24hr, fetchDailyKlines } from './binance.mjs';
import { parseArgs, scanOpts } from './args.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const DEFAULTS = { minQuoteVolume: 5_000_000, prefilterCount: 120, minDayPct: 1.0, minTodayPct: 0.2, concurrency: 5 };

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

const pct = (o, c) => ((c - o) / o) * 100;
const day = (k) => ({ date: new Date(k.openTime).toISOString().slice(0, 10), open: k.open, close: k.close, pct: pct(k.open, k.close) });

export async function scan(opts = {}) {
  const p = { ...DEFAULTS, ...opts };
  const [syms, tickers] = await Promise.all([listUsdtSpotSymbols(), fetch24hr()]);
  const tmap = new Map(tickers.map((t) => [t.symbol, t]));
  const pre = syms.map((s) => ({ ...s, t: tmap.get(s.symbol) }))
    .filter((s) => s.t && +s.t.quoteVolume >= p.minQuoteVolume)
    .sort((a, b) => +b.t.priceChangePercent - +a.t.priceChangePercent)
    .slice(0, p.prefilterCount);

  const candidates = [];
  await pool(pre, p.concurrency, async (s) => {
    let k;
    try { k = await fetchDailyKlines(s.symbol, 4); } catch (e) { console.error(`klines ${s.symbol}: ${e.message}`); return; }
    if (k.length < 3) return;
    const [k2, k1, k0] = k.slice(-3);
    if (!k2.isClosed || !k1.isClosed || k0.isClosed) return;
    const days = { d2: day(k2), d1: day(k1), d0: day(k0) };
    if (days.d2.pct < p.minDayPct || days.d1.pct < p.minDayPct || days.d0.pct < p.minTodayPct) return;
    candidates.push({
      symbol: s.symbol, base: s.base, quote: s.quote, days,
      cum3dPct: (k0.close / k2.open - 1) * 100,
      quoteVolume24h: +s.t.quoteVolume, lastPrice: +s.t.lastPrice, priceChangePercent24h: +s.t.priceChangePercent,
    });
  });
  candidates.sort((a, b) => b.cum3dPct - a.cum3dPct);
  return { generatedAt: new Date().toISOString(), params: p, candidates };
}

const f = (n) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

export function printTable(r) {
  console.log(`${r.candidates.length} candidates (prefiltered ${r.params.prefilterCount}, vol >= ${r.params.minQuoteVolume})`);
  console.log('SYMBOL'.padEnd(12) + 'D-2'.padStart(9) + 'D-1'.padStart(9) + 'TODAY'.padStart(9) + '3D'.padStart(10) + 'VOL24h(M)'.padStart(11));
  for (const c of r.candidates) {
    const d = c.days;
    console.log(c.symbol.padEnd(12) + f(d.d2.pct).padStart(9) + f(d.d1.pct).padStart(9) + f(d.d0.pct).padStart(9) + f(c.cum3dPct).padStart(10) + (c.quoteVolume24h / 1e6).toFixed(1).padStart(11));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = parseArgs();
  const r = await scan(scanOpts(a));
  printTable(r);
  const dir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'runs');
  mkdirSync(dir, { recursive: true });
  const out = resolve(dir, 'scan-latest.json');
  writeFileSync(out, JSON.stringify(r, null, 2));
  console.log(out);
}
