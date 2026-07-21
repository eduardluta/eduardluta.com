import type { Lang } from '../i18n/ui';

export type Localized = Record<Lang, string>;

/** Home bio paragraphs. The final one renders muted. */
export const bio: { text: Localized; muted?: boolean }[] = [
  {
    text: {
      en: 'I spent 10+ years in marketing and a few in the dating industry. I build at the intersection of AI and meaning — dua.com for Albanians seeking love, MIK Group for businesses seeking growth.',
      sq: 'Kalova 10+ vjet në marketing dhe disa në industrinë e takimeve. Ndërtoj në kryqëzimin e AI-së dhe kuptimit — dua.com për shqiptarët në kërkim të dashurisë, MIK Group për bizneset në kërkim të rritjes.',
    },
  },
  {
    text: {
      en: "Here I write about what's real: consciousness, code, marketing, and the patterns connecting them all.",
      sq: 'Këtu shkruaj për atë që është e vërtetë: vetëdija, kodi, marketingu dhe modelet që i lidhin të gjitha.',
    },
  },
  {
    text: {
      en: 'No status games. Just thoughts worth sharing and events worth documenting.',
      sq: "Pa lojëra statusi. Vetëm mendime që ia vlen t'i ndaj dhe ngjarje që ia vlen t'i dokumentoj.",
    },
    muted: true,
  },
];
