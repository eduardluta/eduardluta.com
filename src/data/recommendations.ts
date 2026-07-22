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
    title: 'Life is an internal game played in an external arena.',
    category: { en: 'Tweet', sq: 'Postim' },
    note: { en: 'The inner game, in one line.', sq: 'Loja e brendshme, në një fjali.' },
    url: 'https://x.com/Stealx/status/2079389763312767164',
  },
  {
    title: 'You need to burn.',
    category: { en: 'Tweet', sq: 'Postim' },
    note: {
      en: 'On getting your spark back: no half-assing — double down and level up.',
      sq: 'Për ta rikthyer shkëndijën: pa gjysmë-masa — dyfisho dhe ngjitu një nivel.',
    },
    url: 'https://x.com/rachcorrine/status/2078556350246773156',
  },
  {
    title: 'Naval — How to Get Rich',
    category: { en: 'Thread', sq: 'Temë' },
    note: { en: 'Wealth creation distilled into principles.', sq: 'Krijimi i pasurisë, i përmbledhur në parime.' },
    url: 'https://twitter.com/naval/status/1002103360646823936',
  },
];
