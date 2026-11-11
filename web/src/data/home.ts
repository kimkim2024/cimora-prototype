import hero1 from '../../../assets/hero-1.jpg';
import hero2 from '../../../assets/hero-2.jpg';
import hero3 from '../../../assets/hero-3.jpg';
import comicCreation from '../../../assets/comic-creation-square.png';
import videoCreation from '../../../assets/video-creation.jpg';
import ocDressUp from '../../../assets/oc-dress-up.png';
import infiniteCanvas from '../../../assets/infinite-canvas.jpg';
import miniTools from '../../../assets/mini-tools-arcade.png';
import work01 from '../../../assets/work-01.jpg';
import work02 from '../../../assets/work-02.jpg';
import work03 from '../../../assets/work-03.jpg';
import work04 from '../../../assets/work-04.jpg';
import ctaBanner from '../../../assets/cta-banner.png';

export type Film = {
  title: string;
  en: string;
  tag: string;
  line: string;
  cover: string;
  /** object-position, so each crop keeps the face in frame */
  position: string;
};

export const REEL: Film[] = [
  {
    title: 'Fire in the New Year',
    en: 'Happy New Year',
    tag: 'Character ensemble · bold palette',
    line: 'A crowd bursts into the frame and sets the first scene of the new year on fire.',
    cover: hero1,
    position: 'center 72%',
  },
  {
    title: 'Within the Shattered Light',
    en: 'Saturday, 22:20',
    tag: 'Light & shadow illustration',
    line: 'The wind turns her hair to scattered light as she gazes quietly into the distance.',
    cover: hero2,
    position: 'center 38%',
  },
  {
    title: 'Different, Together',
    en: 'Art style & character design',
    tag: 'Character design · art style',
    line: 'Every character is different, yet they share one world.',
    cover: hero3,
    position: 'center 62%',
  },
];

export const CAPABILITIES = [
  { title: 'Comic creation', line: 'Let your story unfold, panel by panel.', image: comicCreation },
  { title: 'Video creation', line: 'Give your visuals a little life.', image: videoCreation },
  { title: 'OC character sheet', line: 'Make every appearance feel familiar.', image: ocDressUp },
  { title: 'Infinite canvas', line: 'Ideas roam free, connections stay clear.', image: infiniteCanvas },
  { title: 'Mini tools', line: 'Start with a small idea.', image: miniTools },
];

export const COMPOSER_MODES = ['Video', 'Comic', 'Canvas'] as const;
export const COMPOSER_MODEL = { name: 'Aurora Dreamscape', tier: 'Fine' };

export const WORK_STORY = {
  title: 'The Last Train Recording',
  tag: 'Mystery · a late reconciliation',
  note: 'Original complete short story',
  cover: work01,
};

export type Work = {
  title: string;
  tag: string;
  type: string;
  cover: string;
  comic: boolean;
  motion: boolean;
};

export const WORKS: Work[] = [
  { title: 'Letters to the Stars', tag: 'Fantasy · original world', type: 'Comic', cover: work02, comic: true, motion: false },
  { title: 'Before the Rain Ends', tag: 'Urban · a gentle reunion', type: 'Comic / Video', cover: work03, comic: true, motion: true },
  { title: 'The Last Train of Summer', tag: 'Youth · a musical journey', type: 'Video concept', cover: work04, comic: false, motion: true },
];

export const RECIPES = [
  {
    title: 'Rainy Day Letters · breathing webtoon',
    category: 'Comic layout',
    desc: 'Generous white space and restrained dialogue leave every reunion room to linger.',
    author: 'Misty Isle Studio',
    tone: 'accent' as const,
  },
  {
    title: 'From one chapter to a motion trailer',
    category: 'Video',
    desc: 'A complete recipe for storyboards, assets, key shots and review.',
    author: 'Cimora Studio',
    tone: 'ink' as const,
  },
  {
    title: 'OC identity sheet · continuity edition',
    category: 'Character assets',
    desc: 'Give appearance, outfit, mood and story relationships something solid to rely on.',
    author: 'Tsukimi Lab',
    tone: 'sunken' as const,
  },
];

export const CTA_BANNER = ctaBanner;
