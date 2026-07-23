import { SITE } from '../consts';
import { SITE_NAME, SITE_EMAIL, social, type Lang } from '../i18n/ui';

// Every helper returns a bare node (no '@context'): BaseLayout merges all nodes
// for a page into a single { '@context', '@graph': [...] } script, so entity
// references (@id) resolve within one document instead of across script blocks.

const sameAs = [social.github, social.linkedin, social.instagram, social.tiktok, social.x];

export function personSchema() {
  return {
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: SITE_NAME,
    givenName: 'Eduard',
    familyName: 'Luta',
    url: SITE,
    email: `mailto:${SITE_EMAIL}`,
    jobTitle: 'Entrepreneur',
    description:
      'Friend, father, husband & entrepreneur building at the intersection of AI and meaning.',
    knowsLanguage: [
      { '@type': 'Language', name: 'English', alternateName: 'en' },
      { '@type': 'Language', name: 'Albanian', alternateName: 'sq' },
    ],
    worksFor: [
      { '@type': 'Organization', name: 'dua.com', url: 'https://dua.com' },
      { '@type': 'Organization', name: 'MIK Group' },
    ],
    sameAs,
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    name: SITE_NAME,
    alternateName: 'eduardluta.com',
    url: SITE,
    description:
      'Personal site of Eduard Luta — essays, projects and principles, in English and Albanian.',
    inLanguage: ['en', 'sq'],
    publisher: { '@id': `${SITE}/#person` },
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  lang: Lang;
  image: string;
  wordCount?: number;
  tags?: string[];
}) {
  return {
    '@type': 'BlogPosting',
    '@id': `${opts.url}#article`,
    headline: opts.title,
    description: opts.description,
    inLanguage: opts.lang,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
    url: opts.url,
    image: opts.image,
    isAccessibleForFree: true,
    ...(opts.wordCount ? { wordCount: opts.wordCount } : {}),
    ...(opts.tags && opts.tags.length
      ? { keywords: opts.tags.join(', '), articleSection: opts.tags[0] }
      : {}),
    author: { '@id': `${SITE}/#person` },
    publisher: { '@id': `${SITE}/#person` },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.url, SITE).href,
    })),
  };
}
