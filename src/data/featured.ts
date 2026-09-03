export type FeaturedItem = {
  /** Article title as published by the outlet. */
  title: string;
  /** Publication name — shown as the small uppercase link label. */
  outlet: string;
  url: string;
};

/** "Featured" — interviews and profiles about Eduard published elsewhere. */
export const featured: FeaturedItem[] = [
  {
    // TODO: confirm the exact published title (thecmo.com is unreachable from CI).
    title: 'Eduard Luta on building dua.com',
    outlet: 'The CMO',
    url: 'https://thecmo.com/career/edward-luta/',
  },
];
