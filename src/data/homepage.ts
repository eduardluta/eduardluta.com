import type { Lang } from '../i18n/ui';

/** The portrait shown on both profile pages and described by their Person node. */
export const portrait = {
  src: '/writing/missing-you-or-missing-control/video-thumbnail.jpg',
  width: 540,
  height: 960,
};

/** Copy for the portrait-led homepage, kept together in both languages. */
export const homepage = {
  en: {
    greeting: 'Hello, I’m Eduard.',
    headline: 'Building businesses.',
    headlineAccent: 'Exploring what matters.',
    introduction: 'Here I write about what’s real: consciousness, code, marketing, and the patterns connecting them all.',
    introductionNote: 'No status games. Just thoughts worth sharing and events worth documenting.',
    buildingAction: 'What I’m building',
    writingAction: 'Read my writing',
    portraitAlt: 'Eduard sitting outdoors in a green shirt, with trees behind him',
    experience: '10+ years in marketing. Still curious. Still building.',
    buildingLabel: 'Building',
    buildingHeading: 'Ideas, out in the world.',
    buildingIntro: 'Different ideas, a shared purpose: helping people connect and grow.',
    buildingMore: 'More about the work',
    writingLabel: 'Writing',
    writingHeading: 'Thinking out loud.',
    writingIntro: 'Personal essays on life, family, and the ideas I keep coming back to.',
    allWriting: 'All writing',
    socialLabel: 'Elsewhere',
  },
  sq: {
    greeting: 'Përshëndetje, jam Eduardi.',
    headline: 'Ndërtoj biznese.',
    headlineAccent: 'Eksploroj atë që ka rëndësi.',
    introduction: 'Këtu shkruaj për atë që është e vërtetë: vetëdijen, kodin, marketingun dhe modelet që i lidhin të gjitha.',
    introductionNote: 'Pa gara për status. Vetëm mendime që ia vlen t’i ndaj dhe ngjarje që ia vlen t’i dokumentoj.',
    buildingAction: 'Çka po ndërtoj',
    writingAction: 'Lexo shkrimet',
    portraitAlt: 'Eduardi i ulur jashtë me një këmishë të gjelbër, me pemë në sfond',
    experience: '10+ vjet në marketing. Ende kureshtar. Ende duke ndërtuar.',
    buildingLabel: 'Projekte',
    buildingHeading: 'Ide që marrin jetë.',
    buildingIntro: 'Ide të ndryshme, një qëllim i përbashkët: t’i ndihmojmë njerëzit të lidhen dhe të rriten.',
    buildingMore: 'Më shumë për punën',
    writingLabel: 'Shkrime',
    writingHeading: 'Mendime me zë të lartë.',
    writingIntro: 'Ese personale për jetën, familjen dhe idetë tek të cilat kthehem.',
    allWriting: 'Të gjitha shkrimet',
    socialLabel: 'Në rrjete',
  },
} as const satisfies Record<Lang, Record<string, string | readonly string[]>>;
