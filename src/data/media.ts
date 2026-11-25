export const citationLabsInterview = {
  outlet: 'Citation Labs',
  url: 'https://citationlabs.com/eduard-luta-ai-search-marketing-teams/',
  image: '/media/citation-labs-ai-search.jpg',
  en: {
    title: 'Eduard Luta on Rebuilding Marketing Teams for AI Search',
    description: 'I spoke with Citation Labs about how we divide the work between the people building our AI tools and the people deciding what’s worth publishing.',
    read: 'Read the interview',
  },
  sq: {
    title: 'Eduard Luta për riorganizimin e ekipeve të marketingut në epokën e kërkimit me AI',
    description: 'Me Citation Labs bisedova për mënyrën si e ndajmë punën mes atyre që ndërtojnë mjetet tona me AI dhe atyre që vendosin çfarë ia vlen të botojmë.',
    read: 'Lexo intervistën në anglisht',
  },
};

export type MediaAppearance = {
  outlet: string;
  program: string;
  url: string;
  image: string;
  format: 'video' | 'short';
};

export const mediaAppearances: MediaAppearance[] = [
  {
    outlet: 'TV Dukagjini',
    program: 'Reload',
    url: 'https://www.youtube.com/watch?v=wWFIB2weSnY',
    image: '/media/dukagjini-reload.jpg',
    format: 'video',
  },
  {
    outlet: 'Urban FM',
    program: 'Afternoon Delight',
    url: 'https://www.youtube.com/watch?v=Kmk95zWEq3w',
    image: '/media/urban-fm.jpg',
    format: 'video',
  },
  {
    outlet: 'RTK',
    program: 'Verë n’RTK',
    url: 'https://www.youtube.com/watch?v=1EapZ3TBJb0',
    image: '/media/rtk-vere-n-rtk.jpg',
    format: 'video',
  },
  {
    outlet: 'TV Dukagjini',
    program: 'Reload',
    url: 'https://www.youtube.com/shorts/op0Th4M9cfQ',
    image: '/media/dukagjini-reload-short.jpg',
    format: 'short',
  },
];
