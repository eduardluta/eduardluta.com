// Routing + formatting helpers for the bilingual site. English (default) lives at
// the root, Albanian under /sq/. Slugs are shared across languages, so switching
// language is just a matter of adding/removing the /sq prefix.

import { defaultLang, type Lang } from './ui';

/** Detect the active language from a URL or pathname. */
export function getLangFromUrl(url: URL | string): Lang {
  const path = typeof url === 'string' ? url : url.pathname;
  const seg = path.replace(/^\/+/, '').split('/')[0];
  return seg === 'sq' ? 'sq' : 'en';
}

/** Remove the language prefix, returning the language-agnostic path (always leading slash). */
export function stripLangFromPath(pathname: string): string {
  const cleaned = pathname.replace(/^\/(sq)(?=\/|$)/, '');
  return cleaned === '' ? '/' : cleaned;
}

/** Prefix a language-agnostic path (e.g. "/writing/") for the given language. */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return clean === '/' ? '/sq/' : `/sq${clean}`;
}

/** Given the current pathname, return the equivalent path in the other language. */
export function getAlternates(pathname: string): Record<Lang, string> {
  const base = stripLangFromPath(pathname);
  return {
    en: localizePath(base, 'en'),
    sq: localizePath(base, 'sq'),
  };
}

const MONTHS: Record<Lang, string[]> = {
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  sq: [
    'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
    'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor',
  ],
};

/** "MM / YYYY" — used in compact writing lists. Numeric, identical across languages. */
export function formatDateShort(date: Date): string {
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${mm} / ${date.getUTCFullYear()}`;
}

/** "10 August 2025" / "10 Gusht 2025" — used on the article page. */
export function formatDateLong(date: Date, lang: Lang): string {
  return `${date.getUTCDate()} ${MONTHS[lang][date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** ISO date (YYYY-MM-DD) for <time datetime> and structured data. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
