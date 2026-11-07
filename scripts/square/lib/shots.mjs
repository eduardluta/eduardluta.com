// Screenshots of the real Binance spot charts via Playwright Chromium.
import { chromium } from 'playwright';
import { mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const MAX_BYTES = 4 * 1024 * 1024;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Privacy first: reject/necessary-only, dismiss only as a fallback. Never "Accept".
async function consent(page) {
  const tries = [
    (p) => p.getByRole('button', { name: /^(reject all|reject|decline|only necessary|necessary only|refuse)/i }),
    (p) => p.getByText(/^(reject all|reject|only necessary|necessary only)$/i),
    (p) => p.locator('#onetrust-reject-all-handler'),
    (p) => p.getByRole('button', { name: /^(close|dismiss)$/i }),
    (p) => p.locator('#onetrust-close-btn-container button, .onetrust-close-btn-handler'),
  ];
  for (const t of tries) {
    try { const el = t(page).first(); await el.click({ timeout: 2500 }); return true; } catch {}
  }
  return false;
}

// Informational risk notices (e.g. "Monitoring Tag") overlay the chart. Acknowledge only; never terms/consent.
async function notices(page) {
  for (let i = 0; i < 3; i++) {
    try { await page.locator('.bn-modal button, [role=dialog] button').filter({ hasText: /^(i understand|got it|ok|close)$/i }).first().click({ timeout: 2000 }); await sleep(500); } catch { return; }
  }
}

async function setDaily(page) {
  const tries = [
    (p) => p.locator('#interval-1d, [id="1d"], [data-testid="1d"]'),
    (p) => p.getByRole('button', { name: /^1d$/i }),
    (p) => p.getByText(/^1d$/i),
  ];
  for (const t of tries) {
    try { await t(page).first().click({ timeout: 2500 }); return true; } catch {}
  }
  return false;
}

const CHART_SELS = ['#tv_chart_container', '[class*="chart-container"]', '[class*="kline"]', '[id*="tradingview"]', '[class*="tradingview"]'];

async function shoot(browser, c, file, dsf) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dsf, userAgent: UA, locale: 'en', timezoneId: 'UTC' });
  const page = await ctx.newPage();
  try {
    const url = `https://www.binance.com/en/trade/${c.base}_USDT?type=spot`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForSelector('canvas, iframe', { timeout: 30000 }).catch(() => {});
    await sleep(3000);
    const consentHit = await consent(page);
    await notices(page);
    const dailyHit = await setDaily(page);
    let box = null, el = null;
    for (const s of CHART_SELS) {
      try {
        await page.waitForSelector(s, { timeout: 8000, state: 'visible' });
        const cand = page.locator(s).first();
        const b = await cand.boundingBox();
        if (b && b.width > 300 && b.height > 200) { el = cand; box = b; break; }
      } catch {}
    }
    await notices(page);
    await sleep(2500);
    let mode = 'viewport';
    if (el) { try { await el.screenshot({ path: file, type: 'png' }); mode = 'clip'; } catch {} }
    if (mode === 'viewport') await page.screenshot({ path: file, type: 'png' });
    return { mode, url, consentHit, dailyHit };
  } finally { await ctx.close(); }
}

export async function capture(candidates, outDir, { top } = {}) {
  mkdirSync(outDir, { recursive: true });
  const list = top ? candidates.slice(0, top) : candidates;
  const results = [];
  const browser = await chromium.launch({ headless: true });
  try {
    for (const c of list) {
      const file = join(outDir, `${c.base}USDT.png`);
      const r = { symbol: c.symbol, base: c.base, file, bytes: 0, mode: null, url: `https://www.binance.com/en/trade/${c.base}_USDT?type=spot` };
      try {
        let info = await shoot(browser, c, file, 2);
        if (statSync(file).size > MAX_BYTES) info = await shoot(browser, c, file, 1);
        Object.assign(r, info);
        r.bytes = statSync(file).size;
        if (r.bytes > MAX_BYTES) r.error = `still ${r.bytes} bytes after retry`;
      } catch (e) { r.error = e.message; }
      console.error(`[shots] ${c.symbol} ${r.mode ?? 'FAILED'} ${r.bytes}B${r.error ? ' ' + r.error : ''}`);
      results.push(r);
    }
  } finally { await browser.close(); }
  return results;
}
