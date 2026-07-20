// Bilingual UI strings + site metadata. English is the default locale (served at
// the root); Albanian is served under /sq/. Every user-facing string that is part
// of the site "chrome" lives here so both languages stay in lockstep.

export const languages = {
  en: 'English',
  sq: 'Shqip',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

export const SITE_NAME = 'Eduard Luta';
export const SITE_EMAIL = 'hello@eduardluta.com';

// Social profiles — universal, used in the footer and the social wall.
export const social = {
  github: 'https://github.com/eduardluta',
  linkedin: 'https://www.linkedin.com/in/eduard-luta/',
  instagram: 'https://www.instagram.com/eduard.luta/',
  tiktok: 'https://www.tiktok.com/@eduardluta',
  x: 'https://x.com/eduardluta',
} as const;

export const ui = {
  en: {
    'site.tagline': 'Friend, father, husband & entrepreneur.',
    'site.description':
      'Eduard Luta — friend, father, husband & entrepreneur building at the intersection of AI and meaning. dua.com for Albanians seeking love, MIK Group for businesses seeking growth.',

    'nav.writing': 'Writing',
    'nav.building': 'Building',
    'nav.principles': 'Principles',
    'nav.social': 'Social',
    'nav.home': 'Home',
    'nav.themeToggle': 'Toggle light / dark',
    'nav.langLabel': 'Language',
    'nav.skip': 'Skip to main content',

    'home.currently': 'Currently — dua.com · MIK Group',
    'home.latestWriting': 'Latest writing',
    'home.allWriting': 'All writing →',
    'home.fromFeeds': 'From the feeds',
    'home.socialWall': 'Social wall →',

    'writing.title': 'Writing',
    'writing.subtitle': "Notes on what's real.",
    'writing.description':
      "Essays and notes by Eduard Luta on consciousness, code, marketing, and the patterns connecting them all.",
    'worth.title': 'Worth the time',
    'worth.subtitle': 'Films, essays, tools & threads I keep coming back to.',

    'building.title': 'Building',
    'building.subtitle': "Things I'm making at the intersection of AI and meaning.",
    'building.description':
      "The things Eduard Luta is building — dua.com, the Albanian dating app, and MIK Group, a Swiss AI-driven marketing agency.",

    'principles.title': 'Principles',
    'principles.subtitle': 'How I try to operate.',
    'principles.description': 'Twenty short principles Eduard Luta tries to operate by.',

    'social.title': 'Social',
    'social.subtitle': 'Straight from my feeds — Instagram, X, LinkedIn & TikTok, one place.',
    'social.description':
      "Eduard Luta across Instagram, X, LinkedIn and TikTok — one place for the feeds.",

    'article.back': '← Writing',
    'article.backToWriting': 'Back to all writing',

    'footer.getInTouch': 'Get in touch',
    'footer.touchLine': 'Have something real to talk about? I read every message.',
    'footer.connect': 'Connect',

    'nl.eyebrow': 'Newsletter',
    'nl.heading': 'Stay in the loop.',
    'nl.body':
      "Occasional notes on what I'm building, writing & thinking. No spam, unsubscribe anytime.",
    'nl.placeholder': 'you@email.com',
    'nl.emailLabel': 'Email address',
    'nl.subscribe': 'Subscribe',
    'nl.sending': 'Subscribing…',
    'nl.doneHeading': "You're in. Thank you.",
    'nl.doneBody': "I'll only write when there's something worth sharing.",
    'nl.errInvalid': 'Please enter a valid email.',
    'nl.errNetwork': 'Something went wrong. Please try again.',
    'nl.close': 'Close',

    'notFound.title': 'Page not found',
    'notFound.body': "The page you're looking for doesn't exist or has moved.",
    'notFound.home': '← Back home',
  },
  sq: {
    'site.tagline': 'Mik, baba, bashkëshort & sipërmarrës.',
    'site.description':
      'Eduard Luta — mik, baba, bashkëshort & sipërmarrës që ndërton në kryqëzimin e AI-së dhe kuptimit. dua.com për shqiptarët në kërkim të dashurisë, MIK Group për bizneset në kërkim të rritjes.',

    'nav.writing': 'Shkrime',
    'nav.building': 'Projekte',
    'nav.principles': 'Parime',
    'nav.social': 'Rrjetet',
    'nav.home': 'Ballina',
    'nav.themeToggle': 'Ndërro dritë / errësirë',
    'nav.langLabel': 'Gjuha',
    'nav.skip': 'Kalo te përmbajtja kryesore',

    'home.currently': 'Aktualisht — dua.com · MIK Group',
    'home.latestWriting': 'Shkrimet e fundit',
    'home.allWriting': 'Të gjitha shkrimet →',
    'home.fromFeeds': 'Nga rrjetet',
    'home.socialWall': 'Muri social →',

    'writing.title': 'Shkrime',
    'writing.subtitle': 'Shënime për atë që është e vërtetë.',
    'writing.description':
      'Ese dhe shënime nga Eduard Luta për vetëdijen, kodin, marketingun dhe modelet që i lidhin të gjitha.',
    'worth.title': 'Ia vlen koha',
    'worth.subtitle': 'Filma, ese, vegla & tema tek të cilat kthehem.',

    'building.title': 'Projekte',
    'building.subtitle': 'Gjëra që po ndërtoj në kryqëzimin e AI-së dhe kuptimit.',
    'building.description':
      'Gjërat që po ndërton Eduard Luta — dua.com, aplikacioni shqiptar i takimeve, dhe MIK Group, agjenci zvicerane marketingu me AI.',

    'principles.title': 'Parime',
    'principles.subtitle': 'Si përpiqem të veproj.',
    'principles.description': 'Njëzet parime të shkurtra sipas të cilave përpiqet të veprojë Eduard Luta.',

    'social.title': 'Rrjetet',
    'social.subtitle': 'Drejt nga rrjetet e mia — Instagram, X, LinkedIn & TikTok, në një vend.',
    'social.description':
      'Eduard Luta në Instagram, X, LinkedIn dhe TikTok — të gjitha rrjetet në një vend.',

    'article.back': '← Shkrime',
    'article.backToWriting': 'Kthehu te të gjitha shkrimet',

    'footer.getInTouch': 'Të flasim',
    'footer.touchLine': 'Ke diçka të vërtetë për të biseduar? I lexoj të gjitha mesazhet.',
    'footer.connect': 'Lidhu',

    'nl.eyebrow': 'Buletin',
    'nl.heading': 'Qëndro në rrjedhë.',
    'nl.body':
      'Shënime herë pas here për çka ndërtoj, shkruaj & mendoj. Pa spam, çregjistrohu kurdo.',
    'nl.placeholder': 'ti@email.com',
    'nl.emailLabel': 'Adresa e email-it',
    'nl.subscribe': 'Regjistrohu',
    'nl.sending': 'Duke u regjistruar…',
    'nl.doneHeading': 'U regjistrove. Faleminderit.',
    'nl.doneBody': 'Do të shkruaj vetëm kur ka diçka që ia vlen.',
    'nl.errInvalid': 'Të lutem shkruaj një email të vlefshëm.',
    'nl.errNetwork': 'Diçka shkoi keq. Provo sërish.',
    'nl.close': 'Mbyll',

    'notFound.title': 'Faqja nuk u gjet',
    'notFound.body': 'Faqja që kërkon nuk ekziston ose është zhvendosur.',
    'notFound.home': '← Kthehu në ballinë',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)['en'];

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}
