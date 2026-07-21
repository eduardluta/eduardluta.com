import { SITE } from '../consts';
import { SITE_NAME, SITE_EMAIL, social, type Lang } from '../i18n/ui';

const sameAs = [social.github, social.linkedin, social.instagram, social.tiktok, social.x];

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: SITE_NAME,
    url: SITE,
    email: `mailto:${SITE_EMAIL}`,
    jobTitle: 'Entrepreneur',
    worksFor: [
      { '@type': 'Organization', name: 'dua.com', url: 'https://dua.com' },
      { '@type': 'Organization', name: 'MIK Group' },
    ],
    sameAs,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    name: SITE_NAME,
    url: SITE,
    inLanguage: ['en', 'sq'],
    publisher: { '@id': `${SITE}/#person` },
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  lang: Lang;
  image: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    inLanguage: opts.lang,
    datePublished: opts.datePublished,
    dateModified: opts.datePublished,
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
    url: opts.url,
    image: opts.image,
    author: { '@id': `${SITE}/#person` },
    publisher: { '@id': `${SITE}/#person` },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.url, SITE).href,
    })),
  };
}
