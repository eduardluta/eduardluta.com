import type { Lang } from '../i18n/ui';

type L = Record<Lang, string>;
type Section = { heading: L; paras: Record<Lang, string[]> };

export type LegalDoc = {
  title: L;
  description: L;
  updated: L;
  sections: Section[];
};

const UPDATED: L = { en: 'Last updated: 21 July 2026', sq: 'Përditësuar së fundmi: 21 Korrik 2026' };

export const privacy: LegalDoc = {
  title: { en: 'Privacy Policy', sq: 'Politika e privatësisë' },
  description: {
    en: 'What limited data eduardluta.com collects and how it is used.',
    sq: 'Cilat të dhëna të kufizuara mbledh eduardluta.com dhe si përdoren.',
  },
  updated: UPDATED,
  sections: [
    {
      heading: { en: 'Overview', sq: 'Përmbledhje' },
      paras: {
        en: [
          'This is the personal website of Eduard Luta. It is intentionally minimal and collects as little data as possible. This policy explains what is collected and why.',
        ],
        sq: [
          'Kjo është faqja personale e Eduard Lutës. Është qëllimisht minimale dhe mbledh sa më pak të dhëna. Kjo politikë shpjegon çfarë mblidhet dhe pse.',
        ],
      },
    },
    {
      heading: { en: 'What we collect', sq: 'Çfarë mbledhim' },
      paras: {
        en: [
          'Newsletter: if you subscribe, we store the email address you enter and your language preference so we can send occasional updates. Nothing more.',
          'Server logs: our host (Railway) may record standard request data such as IP address and browser type to operate and secure the site.',
          'Analytics: we use Google Analytics to understand, in aggregate, how the site is visited (pages viewed, approximate region, device type). This data is not used for advertising, and we have disabled sharing it with other Google products.',
          'There are no advertising trackers, and we do not build profiles about you.',
        ],
        sq: [
          'Buletini: nëse regjistroheni, ruajmë adresën e email-it që shkruani dhe preferencën tuaj të gjuhës, që të dërgojmë përditësime herë pas here. Asgjë më shumë.',
          'Regjistrat e serverit: pritësi ynë (Railway) mund të regjistrojë të dhëna standarde kërkese si adresa IP dhe lloji i shfletuesit, për të operuar dhe siguruar faqen.',
          'Analitika: përdorim Google Analytics për të kuptuar, në mënyrë të përmbledhur, si vizitohet faqja (faqet e para, rajoni i përafërt, lloji i pajisjes). Këto të dhëna nuk përdoren për reklama dhe e kemi çaktivizuar ndarjen e tyre me produktet e tjera të Google.',
          'Nuk ka gjurmues reklamash dhe nuk ndërtojmë profile për ju.',
        ],
      },
    },
    {
      heading: { en: 'Social content', sq: 'Përmbajtja sociale' },
      paras: {
        en: [
          "The social wall shows Eduard's own public posts from Instagram and TikTok, fetched through those platforms' official APIs when the site is built. It does not collect any data about you from those platforms.",
        ],
        sq: [
          'Muri social shfaq postimet publike të vetë Eduardit nga Instagram dhe TikTok, të marra përmes API-ve zyrtare të atyre platformave kur ndërtohet faqja. Nuk mbledh asnjë të dhënë për ju nga ato platforma.',
        ],
      },
    },
    {
      heading: { en: 'Service providers', sq: 'Ofruesit e shërbimit' },
      paras: {
        en: [
          'We use a small number of providers solely to run the site: Netlify (hosting) and Railway (the database that stores newsletter subscriptions). We do not sell or rent your data to anyone.',
        ],
        sq: [
          'Përdorim një numër të vogël ofruesish vetëm për të mbajtur faqen: Netlify (strehim) dhe Railway (baza e të dhënave që ruan regjistrimet e buletinit). Nuk i shesim dhe nuk i japim me qira të dhënat tuaja askujt.',
        ],
      },
    },
    {
      heading: { en: 'Your choices', sq: 'Zgjedhjet tuaja' },
      paras: {
        en: [
          'You can unsubscribe at any time using the link in any newsletter email, or email info@eduardluta.com to have your address removed.',
        ],
        sq: [
          'Mund të çregjistroheni në çdo kohë duke përdorur lidhjen në çdo email të buletinit, ose shkruani te info@eduardluta.com që adresa juaj të hiqet.',
        ],
      },
    },
    {
      heading: { en: 'Contact', sq: 'Kontakt' },
      paras: {
        en: ['Questions about this policy? Email info@eduardluta.com.'],
        sq: ['Pyetje për këtë politikë? Shkruani te info@eduardluta.com.'],
      },
    },
  ],
};

export const terms: LegalDoc = {
  title: { en: 'Terms of Service', sq: 'Kushtet e shërbimit' },
  description: {
    en: 'The basic terms for using eduardluta.com.',
    sq: 'Kushtet bazë për përdorimin e eduardluta.com.',
  },
  updated: UPDATED,
  sections: [
    {
      heading: { en: 'Acceptance', sq: 'Pranimi' },
      paras: {
        en: ['By using eduardluta.com you agree to these terms. If you do not agree, please do not use the site.'],
        sq: ['Duke përdorur eduardluta.com ju pranoni këto kushte. Nëse nuk pajtoheni, ju lutemi mos e përdorni faqen.'],
      },
    },
    {
      heading: { en: 'Content & intellectual property', sq: 'Përmbajtja & pronësia intelektuale' },
      paras: {
        en: [
          'Unless stated otherwise, the writing and design on this site are © Eduard Luta. You are welcome to read and share links, but not to republish the content as your own.',
        ],
        sq: [
          'Përveçse kur thuhet ndryshe, shkrimet dhe dizajni në këtë faqe janë © Eduard Luta. Jeni të mirëpritur t’i lexoni dhe të ndani lidhjet, por jo ta ripublikoni përmbajtjen si tuajën.',
        ],
      },
    },
    {
      heading: { en: 'Newsletter', sq: 'Buletini' },
      paras: {
        en: ['The newsletter is occasional and optional. You can unsubscribe at any time.'],
        sq: ['Buletini është herë pas here dhe fakultativ. Mund të çregjistroheni në çdo kohë.'],
      },
    },
    {
      heading: { en: 'External links', sq: 'Lidhjet e jashtme' },
      paras: {
        en: [
          'The site links to social profiles and other external websites. We are not responsible for the content or practices of those third-party sites.',
        ],
        sq: [
          'Faqja lidhet me profile sociale dhe faqe të tjera të jashtme. Nuk jemi përgjegjës për përmbajtjen ose praktikat e atyre faqeve të palëve të treta.',
        ],
      },
    },
    {
      heading: { en: 'Disclaimer', sq: 'Klauzolë mospërgjegjësie' },
      paras: {
        en: ['The site is provided "as is", without warranties of any kind. Use it at your own discretion.'],
        sq: ['Faqja ofrohet "siç është", pa garanci të asnjë lloji. Përdoreni sipas gjykimit tuaj.'],
      },
    },
    {
      heading: { en: 'Changes & contact', sq: 'Ndryshimet & kontakti' },
      paras: {
        en: ['These terms may be updated from time to time. Questions? Email info@eduardluta.com.'],
        sq: ['Këto kushte mund të përditësohen herë pas here. Pyetje? Shkruani te info@eduardluta.com.'],
      },
    },
  ],
};

export const legalDocs = { privacy, terms };
