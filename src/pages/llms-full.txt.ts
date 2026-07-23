import type { APIRoute } from 'astro';
import { SITE } from '../consts';
import { getArticles } from '../lib/writing';
import { isoDate } from '../i18n/utils';

// llms-full.txt: the complete English essay corpus as one markdown document,
// for LLM ingestion. Small site (~21 essays), so shipping the full text is cheap.
export const GET: APIRoute = async () => {
  const en = await getArticles('en');

  const sections = en.map((a) =>
    [
      `## ${a.data.title}`,
      '',
      `URL: ${SITE}/writing/${a.slug}/`,
      `Published: ${isoDate(a.data.date)}`,
      '',
      (a.body ?? '').trim(),
    ].join('\n')
  );

  const doc = [
    '# Eduard Luta — Writing (full corpus)',
    '',
    '> All essays from eduardluta.com in English. Albanian versions live under /sq/writing/.',
    '',
    sections.join('\n\n---\n\n'),
    '',
  ].join('\n');

  return new Response(doc, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
