import type { Lang } from '../i18n/ui';

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

// The wall is live-only: every post comes from scripts/fetch-social.mjs at build
// time (X + TikTok today; Instagram ready once a token is configured). The old
// hand-written placeholder posts are gone — nothing fake ships to the site.
