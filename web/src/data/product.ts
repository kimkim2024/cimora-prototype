export type Stage = {
  id: string;
  no: string;
  title: string;
  description: string;
  href: string;
  /** read out on the diagram when the stage is active */
  stat: string;
};

/** The three production stages, copy carried over from the product page. */
export const STAGES: Stage[] = [
  {
    id: 'webtoon',
    no: '01',
    title: 'Comic creation',
    description:
      'From ideas and novels to full stories: confirm the narrative first, then bring characters into the frame.',
    href: '#/features/webtoon',
    stat: 'Chapter 01 · 12 panels ready',
  },
  {
    id: 'motion-comic',
    no: '02',
    title: 'Video production',
    description:
      'Camera moves, dialogue, subtitles and limited animation form a stable draft. Key actions are left to the enhanced candidates you pick.',
    href: '#/features/motion-comic',
    stat: '4 shots · 48s · camera stable',
  },
  {
    id: 'studio',
    no: '03',
    title: 'Studio production',
    description:
      'Projects, assets, versions, quality and budget in one place. Make continuous production clearer.',
    href: '#/features/studio',
    stat: '6 assets · v2 locked · on budget',
  },
];

/** Cumulative spend per chapter, against the chapter budget. */
export const BUDGET = {
  unit: '$',
  limit: 1.2,
  values: [0.12, 0.27, 0.39, 0.52, 0.61, 0.74, 0.86, 0.98],
};
