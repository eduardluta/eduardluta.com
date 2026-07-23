import type { APIRoute } from 'astro';
import { SITE } from '../consts';
import { getArticles } from '../lib/writing';

// llms.txt (llmstxt.org): a curated, always-current map of the site for AI
// crawlers and assistants. Prerendered at build time, so it can never go stale
// relative to the deployed content.
export const GET: APIRoute = async () => {
  const en = await getArticles('en');

  const lines = [
    '# Eduard Luta',
    '',
    '> Personal site of Eduard Luta — friend, father, husband & entrepreneur building at the intersection of AI and meaning. Founder of dua.com (dating for Albanians) and MIK Group (Swiss AI-driven marketing). Essays in English and Albanian.',
    '',
    '## Writing',
    '',
    ...en.map(
      (a) => `- [${a.data.title}](${SITE}/writing/${a.slug}/): ${a.data.description}`
    ),
    '',
    '## Pages',
    '',
    `- [Building](${SITE}/building/): current projects — dua.com and MIK Group`,
    `- [Principles](${SITE}/principles/): twenty short operating principles`,
    `- [Social](${SITE}/social/): Instagram, X, LinkedIn and TikTok feeds`,
    '',
    '## Albanian (Shqip)',
    '',
    `- [Ballina](${SITE}/sq/): the full site in Albanian`,
    `- [Shkrime](${SITE}/sq/writing/): all essays in Albanian`,
    '',
    '## Feeds',
    '',
    `- [RSS (English)](${SITE}/rss.xml)`,
    `- [RSS (Albanian)](${SITE}/sq/rss.xml)`,
    `- [Full essay corpus for LLMs](${SITE}/llms-full.txt)`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
