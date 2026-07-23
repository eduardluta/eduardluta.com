import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_NAME } from '../i18n/ui';
import { getArticles } from '../lib/writing';

// English writing feed. Prerendered to a static /rss.xml at build time.
export async function GET(context: APIContext) {
  const articles = await getArticles('en');
  return rss({
    title: `${SITE_NAME} — Writing`,
    description:
      "Essays and notes by Eduard Luta on consciousness, code, marketing, and the patterns connecting them all.",
    // Channel <link> = the HTML page this feed corresponds to. Item links are
    // root-relative, so they still resolve against the origin.
    site: new URL('/writing/', context.site).href,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.date,
      description: article.data.description,
      link: `/writing/${article.slug}/`,
    })),
    customData: '<language>en</language>',
  });
}
