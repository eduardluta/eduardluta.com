// Orchestrator: scan -> research -> shots -> compose. Never publishes.
import { parseArgs, scanOpts } from './lib/args.mjs';
import { scan } from './lib/scan.mjs';
import { research } from './lib/research.mjs';
import { capture } from './lib/shots.mjs';
import { compose } from './lib/compose.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const a = parseArgs();
const top = a.top ?? 3;
const now = new Date();
const id = now.toISOString().slice(0, 16).replace('T', '-').replace(':', '');
const dir = join(ROOT, 'runs', id);
mkdirSync(dir, { recursive: true });
const save = (n, v) => writeFileSync(join(dir, n), typeof v === 'string' ? v : JSON.stringify(v, null, 2));

const sc = await scan(scanOpts(a));
save('scan.json', sc);
console.error(`[scan] ${sc.candidates.length} candidates`);
if (!sc.candidates.length) {
  console.log('No candidates met the thresholds. Loosen with --min-volume / --min-day-pct / --min-today-pct / --prefilter.');
  process.exit(0);
}
const picked = sc.candidates.slice(0, top);

const rs = a.skipResearch ? [] : await research(picked, { topN: top, today: now.toISOString().slice(0, 10) });
save('research.json', rs);
const sh = a.skipShots ? [] : await capture(picked, join(dir, 'shots'), { top });
save('shots.json', sh);

const publishCmd = `cd ${ROOT} && npm run publish -- --run ${dir} --confirm`;
const { post, markdown } = compose({ scan: sc, research: rs, shots: sh, opts: { top, publishCmd } });
save('post.json', post);
save('draft.md', markdown);
writeFileSync(join(ROOT, 'runs', 'latest'), JSON.stringify({ runId: id, dir }, null, 2));

console.log(`run ${id}: ${sc.candidates.length} candidates, ${picked.map((c) => c.symbol).join(', ')}`);
console.log(`post ${post.content.length} chars; shots ${sh.filter((s) => !s.error).length}/${sh.length}`);
console.log(`draft: ${resolve(dir, 'draft.md')}`);
console.log(`publish (manual): ${publishCmd}`);
