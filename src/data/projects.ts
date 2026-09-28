import type { Localized } from './home';

export type Project = {
  id: string;
  name: string;
  stat?: Localized;
  description: Localized;
  summary: Localized;
  category: Localized;
  logo: { src: string; width: number; height: number };
  url?: string;
};

/** "Building" — things being made at the intersection of AI and meaning. */
export const projects: Project[] = [
  {
    id: 'dua',
    name: 'dua.com',
    logo: { src: '/brands/dua.png', width: 1638, height: 368 },
    stat: { en: '1M+ users', sq: '1M+ përdorues' },
    summary: { en: 'Helping Albanians find love and meaningful connection.', sq: 'I ndihmojmë shqiptarët të gjejnë dashuri dhe lidhje me kuptim.' },
    category: { en: 'Dating & connection', sq: 'Takime & lidhje' },
    description: {
      en: 'Albanian dating app with more than 1 million users.',
      sq: 'Aplikacion takimesh shqiptar me mbi një milion përdorues.',
    },
    url: 'https://dua.com',
  },
  {
    id: 'mik',
    name: 'MIK Group',
    logo: { src: '/brands/mikgroup.svg', width: 128, height: 27 },
    stat: { en: 'Since 2011', sq: 'Që nga 2011' },
    summary: { en: 'Growing businesses through search, marketing, and AI.', sq: 'I rrisim bizneset përmes kërkimit, marketingut dhe AI-së.' },
    category: { en: 'Swiss digital agency', sq: 'Agjenci dixhitale zvicerane' },
    description: {
      en: 'Digital marketing agency in Switzerland. 500+ clients, specialised in AI-driven SEO.',
      sq: 'Agjenci marketingu dixhital në Zvicër. 500+ klientë, e specializuar në SEO me AI.',
    },
  },
  {
    id: 'spotted',
    name: 'spotted.de',
    logo: { src: '/brands/spotted.svg', width: 137, height: 37 },
    summary: {
      en: 'Helping people reconnect with someone they crossed paths with.',
      sq: 'I ndihmojmë njerëzit të rilidhen me dikë që e kanë hasur në jetën e përditshme.',
    },
    description: {
      en: 'A dating app for reconnecting with people you have crossed paths with in everyday life.',
      sq: 'Aplikacion njohjesh për t’u rilidhur me njerëzit që ke hasur në jetën e përditshme.',
    },
    category: { en: 'Dating & real-life connections', sq: 'Njohje & lidhje në jetën reale' },
    url: 'https://www.spotted.de/',
  },
  {
    id: 'bethe',
    name: 'bethe.one',
    logo: { src: '/brands/bethe-one.svg', width: 212, height: 125 },
    summary: {
      en: 'Turning personal growth into a daily practice.',
      sq: 'E kthen zhvillimin personal në praktikë të përditshme.',
    },
    description: {
      en: 'A place to turn personal growth into a daily practice.',
      sq: 'Një vend për ta kthyer zhvillimin personal në praktikë të përditshme.',
    },
    category: { en: 'Personal growth', sq: 'Zhvillim personal' },
    url: 'https://bethe.one/',
  },
];
