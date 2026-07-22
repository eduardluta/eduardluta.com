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

/** The set of article slugs that exist in each language. */
export async function getArticleSlugSets(): Promise<Record<Lang, Set<string>>> {
  const entries = await getCollection('writing');
  const sets: Record<Lang, Set<string>> = { en: new Set(), sq: new Set() };
  for (const entry of entries) {
    const { lang, slug } = parseId(entry.id);
    sets[lang].add(slug);
  }
  return sets;
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
