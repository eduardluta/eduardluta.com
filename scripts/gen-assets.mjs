// Generates raster assets that social platforms and browsers need in PNG form:
// the OG share image, apple-touch-icon, and PWA icons. Run with `npm run assets`.
// Source of truth for the mark is public/favicon.svg (charcoal square, pine "EL").

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

const MONO = "'IBM Plex Mono','Menlo','DejaVu Sans Mono',monospace";

const iconSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#15130f"/>
  <text x="50" y="53" font-family="${MONO}" font-size="46" font-weight="600" fill="#5aa384"
        text-anchor="middle" dominant-baseline="central" letter-spacing="-2">EL</text>
</svg>`;

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f4ee"/>
  <rect x="0" y="0" width="10" height="630" fill="#2f5d4f"/>
  <text x="90" y="250" font-family="${MONO}" font-size="30" font-weight="500" fill="#2f5d4f"
        letter-spacing="6">EDUARD LUTA</text>
  <text x="88" y="330" font-family="${MONO}" font-size="52" font-weight="600" fill="#1b1712"
        letter-spacing="-1">Friend, father, husband</text>
  <text x="88" y="398" font-family="${MONO}" font-size="52" font-weight="600" fill="#1b1712"
        letter-spacing="-1">&amp; entrepreneur.</text>
  <text x="90" y="500" font-family="${MONO}" font-size="24" font-weight="400" fill="#6f685c">
    Building at the intersection of AI and meaning.
  </text>
  <text x="90" y="560" font-family="${MONO}" font-size="22" font-weight="500" fill="#2f5d4f">
    eduardluta.com · dua.com · MIK Group
  </text>
</svg>`;

async function png(svg, size, name) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(PUBLIC, name));
  console.log('  ✓', name);
}

async function main() {
  console.log('Generating raster assets…');
  await png(iconSvg(180), 180, 'apple-touch-icon.png');
  await png(iconSvg(192), 192, 'icon-192.png');
  await png(iconSvg(512), 512, 'icon-512.png');
  await png(iconSvg(1024), 1024, 'icon-1024.png');

  await sharp(Buffer.from(ogSvg)).png().toFile(join(PUBLIC, 'og-default.png'));
  console.log('  ✓ og-default.png');
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
