import type { Localized } from './home';

export type Project = {
  name: string;
  stat: Localized;
  description: Localized;
  url?: string;
};

/** "Building" — things being made at the intersection of AI and meaning. */
export const projects: Project[] = [
  {
    name: 'dua.com',
    stat: { en: '1M+ users', sq: '1M+ përdorues' },
    description: {
      en: 'Albanian dating app with more than 1 million users.',
      sq: 'Aplikacion takimesh shqiptar me mbi një milion përdorues.',
    },
    url: 'https://dua.com',
  },
  {
    name: 'MIK Group',
    stat: { en: 'Since 2011', sq: 'Që nga 2011' },
    description: {
      en: 'Digital marketing agency in Switzerland. 500+ clients, specialised in AI-driven SEO.',
      sq: 'Agjenci marketingu dixhital në Zvicër. 500+ klientë, e specializuar në SEO me AI.',
    },
  },
];
