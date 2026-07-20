import { social, type Lang } from '../i18n/ui';

export type Platform = 'Instagram' | 'X / Twitter' | 'LinkedIn' | 'TikTok';

export type SocialPost = {
  platform: Platform;
  handle: string;
  href: string;
  /** Universal caption — not translated; mirrors the native post. */
  caption: string;
  /** Engagement summary. */
  meta: string;
  /** Relative date label — localized chrome. */
  date: Record<Lang, string>;
  /** Media aspect for image posts; text posts have no media. */
  media?: 'square' | 'portrait';
  /** Local optimized image path (e.g. /social/ig-123.webp) for live posts. */
  image?: string;
  /** Unix ms of the original post, for recency sorting (live posts only). */
  timestamp?: number;
};

/**
 * Curated fallback wall. Shown when the live Instagram/TikTok feed is not
 * configured (no tokens) or fails to fetch, so the wall always looks complete.
 * When the live feed IS present, the Instagram/TikTok entries here are replaced
 * by real posts and only the X / LinkedIn entries below are kept (those two
 * platforms have no practical public API — edit them by hand).
 */

// Social posts are universal and mixed-language — they mirror the real accounts and
// will be wired to live feeds later. Engagement counts, dates and media are placeholders.
export const posts: SocialPost[] = [
  {
    platform: 'Instagram',
    handle: '@eduard.luta',
    href: social.instagram,
    caption: 'Morning in Prishtina. Coffee, code, a clear head.',
    meta: '320 likes · 24 comments',
    date: { en: '2 days ago', sq: 'para 2 ditësh' },
    media: 'square',
  },
  {
    platform: 'X / Twitter',
    handle: '@eduardluta',
    href: social.x,
    caption: "The best product decisions I've made started as a note to myself at 6am.",
    meta: '48 reposts · 210 likes',
    date: { en: '4 days ago', sq: 'para 4 ditësh' },
  },
  {
    platform: 'LinkedIn',
    handle: 'Eduard Luta',
    href: social.linkedin,
    caption: "dua.com just crossed 1M Albanians finding connection. Grateful doesn't cover it.",
    meta: '1.2k reactions · 86 comments',
    date: { en: '1 week ago', sq: 'para një jave' },
  },
  {
    platform: 'TikTok',
    handle: '@eduardluta',
    href: social.tiktok,
    caption: 'A day between Zug & Prishtina.',
    meta: '45k views · 3.1k likes',
    date: { en: '3 weeks ago', sq: 'para 3 javësh' },
    media: 'portrait',
  },
  {
    platform: 'Instagram',
    handle: '@eduard.luta',
    href: social.instagram,
    caption: 'Family > everything. Sunday reset.',
    meta: '512 likes · 41 comments',
    date: { en: '1 month ago', sq: 'para një muaji' },
    media: 'square',
  },
];

/** Rename the curated set for clarity — it is the fallback wall. */
export const curatedPosts = posts;
