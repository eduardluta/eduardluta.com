// Tiny argv parser: --flag, --no-flag, --key value, --key=value. Numbers are coerced.
const coerce = (v) => (v !== '' && !isNaN(Number(v)) ? Number(v) : v);

export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    let [k, v] = a.slice(2).split(/=(.*)/s);
    if (v === undefined) {
      if (k.startsWith('no-')) { out[camel(k.slice(3))] = false; continue; }
      const next = argv[i + 1];
      if (next !== undefined && !(next.startsWith('--'))) { v = next; i++; } else { out[camel(k)] = true; continue; }
    }
    out[camel(k)] = coerce(v);
  }
  return out;
}

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

// Maps CLI flags onto scan options.
export function scanOpts(a) {
  const o = {};
  if (a.minVolume != null) o.minQuoteVolume = a.minVolume;
  if (a.minDayPct != null) o.minDayPct = a.minDayPct;
  if (a.minTodayPct != null) o.minTodayPct = a.minTodayPct;
  if (a.prefilter != null) o.prefilterCount = a.prefilter;
  if (a.top != null) o.top = a.top;
  return o;
}
