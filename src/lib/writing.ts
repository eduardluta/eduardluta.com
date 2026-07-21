import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type Article = CollectionEntry<'writing'> & { lang: Lang; slug: string };

/** Split a collection id ("en/some-slug") into its language and slug. */
function parseId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: (lang === 'sq' ? 'sq' : 'en') as Lang, slug: rest.join('/') };
}

/** All published articles for a language, newest first. */
export async function getArticles(lang: Lang): Promise<Article[]> {
  const entries = await getCollection('writing', ({ data }) => import.meta.env.PROD ? !data.draft : true);
  return entries
    .map((entry) => ({ entry, ...parseId(entry.id) }))
    .filter((x) => x.lang === lang)
    .map(({ entry, slug, lang }) => ({ ...entry, lang, slug }))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Every (lang, slug) pair for static path generation. */
export async function getAllArticleParams(): Promise<Article[]> {
  const entries = await getCollection('writing');
  return entries.map((entry) => {
    const { lang, slug } = parseId(entry.id);
    return { ...entry, lang, slug };
  });
}
