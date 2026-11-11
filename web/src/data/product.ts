import storyWorld from '../../../assets/cimora-story-0.webp';
import storyPanels from '../../../assets/cimora-story-1.webp';
import storyMotion from '../../../assets/cimora-story-4.webp';
import storyDelivery from '../../../assets/cimora-story-5.webp';

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

export type WorldTile = { id: string; label: string; src: string; alt: string };

/** The four stills that summarise the product, in order of production. */
export const PRODUCT_WORLD: WorldTile[] = [
  { id: 'story', label: 'Story & Characters', src: storyWorld, alt: 'Bookshop at dusk with warm windows' },
  { id: 'panels', label: 'Comic Panels', src: storyPanels, alt: 'Character portrait in the rain' },
  { id: 'motion', label: 'Motion Shot', src: storyMotion, alt: 'Two characters sharing an umbrella' },
  { id: 'delivery', label: 'Delivery & Promotion', src: storyDelivery, alt: 'Character at golden hour' },
];

export type Mode = {
  id: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  primary: boolean;
};

export const MODES: Mode[] = [
  {
    id: 'quick',
    title: 'Quick mode',
    body: 'See a complete direction first, then decide how deep to go. Character drafts and storyboards are arranged automatically, ideal for testing ideas.',
    cta: 'Try a story fast',
    href: '#/app/new?mode=quick',
    primary: false,
  },
  {
    id: 'studio',
    title: 'Studio mode',
    body: 'Confirm characters, scenes, style and storyboard first, then generate in batches. Ideal for building your own world over time.',
    cta: 'Create a project',
    href: '#/app/new?mode=studio',
    primary: true,
  },
];
