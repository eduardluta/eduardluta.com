import type { Localized } from './home';

export type Recommendation = {
  title: string;
  category: Localized;
  note: Localized;
  /** External link. Omitted when there is no canonical URL yet. */
  url?: string;
};

/** "Worth the time" — films, essays, tools & threads worth returning to. */
export const recommendations: Recommendation[] = [
  {
    title: 'The Dark Knight',
    category: { en: 'Movie', sq: 'Film' },
    note: { en: 'Chaos versus order, done perfectly.', sq: 'Kaos kundrejt rendit, realizuar në përsosmëri.' },
    url: 'https://www.imdb.com/title/tt0468569/',
  },
  {
    title: 'How to Get Startup Ideas',
    category: { en: 'Article', sq: 'Artikull' },
    note: { en: 'Solve problems you actually have.', sq: 'Zgjidh problemet që i ke me të vërtetë.' },
    url: 'https://www.paulgraham.com/startupideas.html',
  },
  {
    title: 'Building Products Users Love',
    category: { en: 'Video', sq: 'Video' },
    note: { en: 'Understand users, build what they recommend.', sq: 'Kupto përdoruesit, ndërto atë që do ta rekomandojnë.' },
  },
  {
    title: 'The Hard Thing About Hard Things',
    category: { en: 'Book', sq: 'Libër' },
    note: { en: 'The most honest book on building a company.', sq: 'Libri më i sinqertë për ndërtimin e një kompanie.' },
    url: 'https://www.amazon.com/dp/0143115766',
  },
  {
    title: 'Naval — How to Get Rich',
    category: { en: 'Thread', sq: 'Temë' },
    note: { en: 'Wealth creation distilled into principles.', sq: 'Krijimi i pasurisë, i përmbledhur në parime.' },
    url: 'https://twitter.com/naval/status/1002103360646823936',
  },
  {
    title: 'Building in Public — Indie Hackers',
    category: { en: 'Podcast', sq: 'Podkast' },
    note: { en: 'Transparency in business, done right.', sq: 'Transparencë në biznes, e bërë si duhet.' },
  },
  {
    title: 'Obsidian',
    category: { en: 'Tool', sq: 'Vegël' },
    note: { en: 'Local-first notes that connect ideas.', sq: 'Shënime lokale që lidhin idetë.' },
    url: 'https://obsidian.md',
  },
];
