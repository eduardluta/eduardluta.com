// One-off migration helper: turn a scraped Medium article (scratchpad/raw/<slug>.md,
// first line `META: {json}`) into a final EN writing entry — downloading its images,
// converting them to webp under public/writing/<slug>/, rewriting the paths, and
// writing src/content/writing/en/<slug>.md. Deterministic: it never rewrites the
// author's prose, only mechanical cleanup (paths, image alts, whitespace).
//
// Usage: node scripts/import-medium.mjs <path-to-raw.md>
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const rawPath = process.argv[2];
if (!rawPath) { console.error('usage: import-medium.mjs <raw.md>'); process.exit(1); }

const ROOT = process.cwd();
let raw = await fs.readFile(rawPath, 'utf8');

// --- metadata -------------------------------------------------------------
const metaMatch = raw.match(/^META:\s*(\{[\s\S]*?\})\s*\n/);
if (!metaMatch) { console.error('no META line in', rawPath); process.exit(1); }
const meta = JSON.parse(metaMatch[1]);
const slug = meta.slug || path.basename(rawPath, '.md');
let body = raw.slice(metaMatch[0].length).trim();

// --- description: prefer the leading *italic standfirst*, else META.desc ---
let description = (meta.desc || '').replace(/\s+/g, ' ').trim();
const stand = body.match(/^\s*\*([^*][^\n]*?)\*\s*(?:\n|$)/);
if (stand) description = stand[1].trim();
if (description.length > 200) description = description.slice(0, 197).replace(/\s+\S*$/, '') + '…';

// --- download images -> webp, build url map -------------------------------
const imgRe = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;
const urls = [...new Set([...body.matchAll(imgRe)].map((m) => m[1]))];
const outDir = path.join(ROOT, 'public', 'writing', slug);
if (urls.length) await fs.mkdir(outDir, { recursive: true });
const map = {};
let idx = 0;
for (const url of urls) {
  idx++;
  const name = `${slug}-${idx}.webp`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).rotate().resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(outDir, name));
    map[url] = `/writing/${slug}/${name}`;
  } catch (e) {
    console.error(`  ! image failed (${url}): ${e.message} — keeping remote URL`);
    map[url] = url; // graceful fallback
  }
}

// --- rewrite image paths, then set alt text from the caption line ---------
body = body.replace(imgRe, (full, url) => full.replace(url, map[url] || url));
// ![](local)\n*Caption*  ->  ![Caption](local)\n*Caption*  (accessibility)
body = body.replace(/!\[\]\((\/writing\/[^)\s]+)\)\n\*([^*\n]+)\*/g, (m, p, cap) => `![${cap.trim()}](${p})\n*${cap.trim()}*`);

// --- conservative whitespace / emphasis tidy ------------------------------
body = body
  .replace(/[ \t]+\n/g, (m) => (m.startsWith('  \n') ? m : '\n')) // keep md hard-breaks (2+ spaces), drop stray trailing space
  .replace(/\n{3,}/g, '\n\n')
  .replace(/(\*\*[^*\n]+?\*\*)(?=["“'‘A-Z])/g, '$1 ') // add space when bold is glued to a following sentence
  .trim();

// --- write final entry ----------------------------------------------------
const yamlStr = (s) => JSON.stringify(String(s));
const fm = `---\ntitle: ${yamlStr(meta.title)}\ndate: ${meta.date}\ndescription: ${yamlStr(description)}\n---\n\n`;
const enDir = path.join(ROOT, 'src', 'content', 'writing', 'en');
await fs.mkdir(enDir, { recursive: true });
await fs.writeFile(path.join(enDir, `${slug}.md`), fm + body + '\n');

console.log(JSON.stringify({ slug, title: meta.title, date: meta.date, images: urls.length, imagesOk: Object.values(map).filter((v) => v.startsWith('/writing/')).length, bodyChars: body.length }));
