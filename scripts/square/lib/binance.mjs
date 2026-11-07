// Public Binance REST (no auth, no key).
const BASE = 'https://api.binance.com';
const STABLES = new Set(['USDC', 'FDUSD', 'TUSD', 'DAI', 'USDP', 'EURI', 'BUSD', 'USD1', 'AEUR']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchJson(path, { retries = 3 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    let wait = 500 * 2 ** i;
    try {
      const res = await fetch(BASE + path);
      if (res.ok) return await res.json();
      const body = (await res.text()).slice(0, 200);
      lastErr = new Error(`Binance ${res.status} ${path}: ${body}`);
      if (res.status !== 429 && res.status < 500) throw Object.assign(lastErr, { fatal: true });
      const ra = Number(res.headers.get('retry-after'));
      if (ra > 0) wait = ra * 1000;
    } catch (e) {
      if (e.fatal) throw e;
      lastErr = lastErr && e === lastErr ? e : new Error(`Binance network error ${path}: ${e.message}`);
    }
    if (i < retries) await sleep(wait);
  }
  throw lastErr;
}

export async function listUsdtSpotSymbols() {
  const info = await fetchJson('/api/v3/exchangeInfo');
  return info.symbols.filter((s) =>
    s.status === 'TRADING' && s.quoteAsset === 'USDT' && s.isSpotTradingAllowed &&
    (s.permissions?.includes('SPOT') || s.permissionSets?.some((p) => p.includes('SPOT'))) &&
    !/(UP|DOWN|BULL|BEAR)$/.test(s.baseAsset) && !STABLES.has(s.baseAsset)
  ).map((s) => ({ symbol: s.symbol, base: s.baseAsset, quote: s.quoteAsset }));
}

export const fetch24hr = () => fetchJson('/api/v3/ticker/24hr');

export async function fetchDailyKlines(symbol, limit) {
  const rows = await fetchJson(`/api/v3/klines?symbol=${symbol}&interval=1d&limit=${limit}`);
  const now = Date.now();
  return rows.map((k) => ({
    openTime: k[0], open: +k[1], high: +k[2], low: +k[3], close: +k[4],
    volume: +k[5], closeTime: k[6], quoteVolume: +k[7], isClosed: k[6] < now,
  }));
}
