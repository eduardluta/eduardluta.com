import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_NAME } from '../../i18n/ui';
import { getArticles } from '../../lib/writing';

// Albanian writing feed. Prerendered to a static /sq/rss.xml at build time.
export async function GET(context: APIContext) {
  const articles = await getArticles('sq');
  return rss({
    title: `${SITE_NAME} — Shkrime`,
    description:
      'Ese dhe shënime nga Eduard Luta për vetëdijen, kodin, marketingun dhe modelet që i lidhin të gjitha.',
    // Channel <link> = the HTML page this feed corresponds to. Item links are
    // root-relative, so they still resolve against the origin.
    site: new URL('/sq/writing/', context.site).href,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.date,
      description: article.data.description,
      link: `/sq/writing/${article.slug}/`,
    })),
    customData: '<language>sq</language>',
  });
}
