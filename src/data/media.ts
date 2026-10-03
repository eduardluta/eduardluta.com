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
