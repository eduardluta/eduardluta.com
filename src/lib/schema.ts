import { SITE } from '../consts';
import { SITE_NAME, SITE_EMAIL, social, useTranslations, type Lang } from '../i18n/ui';
import { portrait } from '../data/homepage';
import type { CollectionEntry } from 'astro:content';

// Every helper returns a bare node (no '@context'): BaseLayout merges all nodes
// for a page into a single { '@context', '@graph': [...] } script, so entity
// references (@id) resolve within one document instead of across script blocks.

const sameAs = [social.github, social.linkedin, social.instagram, social.tiktok, social.x];

export function personSchema(lang: Lang, profile = false) {
  return {
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: SITE_NAME,
    url: `${SITE}/`,
    email: `mailto:${SITE_EMAIL}`,
    // The profile shows this identity line and portrait. Other pages only
    // identify the author and link to his public profiles in their footer.
    ...(profile ? {
      description: useTranslations(lang)('site.tagline'),
      image: new URL(portrait.src, SITE).href,
    } : {}),
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
      'Personal site of Eduard Luta — essays and projects, in English and Albanian.',
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
  image?: string;
  wordCount?: number;
  tags?: string[];
  videoId?: string;
}) {
  return {
    '@type': 'BlogPosting',
    '@id': `${opts.url}#article`,
    headline: opts.title,
    description: opts.description,
    inLanguage: opts.lang,
    datePublished: opts.datePublished,
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    mainEntityOfPage: { '@id': `${opts.url}#webpage` },
    url: opts.url,
    ...(opts.image ? { image: opts.image } : {}),
    ...(opts.videoId ? { video: { '@id': opts.videoId } } : {}),
    isAccessibleForFree: true,
    ...(opts.wordCount ? { wordCount: opts.wordCount } : {}),
    ...(opts.tags && opts.tags.length
      ? { keywords: opts.tags.join(', ') }
      : {}),
    author: { '@id': `${SITE}/#person` },
    publisher: { '@id': `${SITE}/#person` },
  };
}

export function videoSchema(opts: {
  pageUrl: string;
  video: NonNullable<CollectionEntry<'writing'>['data']['video']>;
}) {
  const { video, pageUrl } = opts;
  const metadata = video.seo;
  if (!metadata) return undefined;

  // Markup describes the embedded video; it does not guarantee video indexing.
  return {
    '@type': 'VideoObject',
    '@id': `${pageUrl}#video`,
    name: metadata.name,
    description: metadata.description,
    uploadDate: metadata.uploadDate,
    thumbnailUrl: new URL(video.poster, SITE).href,
    embedUrl: `https://www.tiktok.com/player/v1/${video.id}?autoplay=0&controls=1&closed_caption=1&rel=0`,
    url: video.url,
    ...(metadata.durationSeconds ? { duration: `PT${metadata.durationSeconds}S` } : {}),
    ...(metadata.language ? { inLanguage: metadata.language } : {}),
    creator: { '@id': `${SITE}/#person` },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${new URL(items[items.length - 1].url, SITE).href}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.url, SITE).href,
    })),
  };
}
