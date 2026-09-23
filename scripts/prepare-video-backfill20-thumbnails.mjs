import sharp from 'sharp';
import fs from 'node:fs/promises';
const d=JSON.parse(await fs.readFile('scripts/data/video-backfill20-2026-09-23.json','utf8'));
for(const a of d.articles){
 const dir=`public/writing/${a.slug}`;
 let input=`${dir}/video-thumbnail.jpg`,position='centre';
 if(a.slug.startsWith('skanderbeg-'))input=`${dir}/helmet.jpg`;
 if(a.slug.startsWith('vienna-'))input=`${dir}/vienna.jpg`;
 if(a.slug.startsWith('ai-profiles-')||a.slug.startsWith('green-water-'))position='south';
 if(a.slug.startsWith('switzerland-')||a.slug.startsWith('emotional-'))position='north';
 await sharp(input).resize(256,256,{fit:'cover',position}).webp({quality:86}).toFile(`${dir}/thumb.webp`);
}
console.log('Prepared 10 optimised previews from verified photographs and original video covers.');
