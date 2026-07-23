import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { localizePath, stripLangFromPath } from '../i18n/utils';

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

/** The set of article slugs that exist in each language. Applies the same PROD
 * draft filter as getArticles so hreflang alternates never point at unbuilt pages. */
export async function getArticleSlugSets(): Promise<Record<Lang, Set<string>>> {
  const entries = await getCollection('writing', ({ data }) => import.meta.env.PROD ? !data.draft : true);
  const sets: Record<Lang, Set<string>> = { en: new Set(), sq: new Set() };
  for (const entry of entries) {
    const { lang, slug } = parseId(entry.id);
    sets[lang].add(slug);
  }
  return sets;
}

/** First markdown image path in an article body (root-relative), or null. Used
 * as the BlogPosting schema image when no explicit heroImage is set. */
export function firstBodyImage(body: string | undefined): string | null {
  const match = body?.match(/!\[[^\]]*\]\((\/[^)\s]+)\)/);
  return match ? match[1] : null;
}

/** Approximate word count of the raw markdown body (images/links stripped). */
export function countWords(body: string | undefined): number {
  if (!body) return 0;
  return body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Language alternates for a pathname, aware of missing translations. For an
 * article that exists in only one language (e.g. imported posts not yet
 * translated), the missing side is `null` so callers can omit the hreflang /
 * fall back gracefully instead of linking to a 404. Non-article paths always
 * resolve both languages.
 */
export async function resolveAlternates(pathname: string): Promise<Record<Lang, string | null>> {
  const base = stripLangFromPath(pathname);
  const match = base.match(/^\/writing\/([^/]+)\/?$/);
  if (!match) {
    return { en: localizePath(base, 'en'), sq: localizePath(base, 'sq') };
  }
  const slug = match[1];
  const sets = await getArticleSlugSets();
  return {
    en: sets.en.has(slug) ? localizePath(base, 'en') : null,
    sq: sets.sq.has(slug) ? localizePath(base, 'sq') : null,
  };
}
