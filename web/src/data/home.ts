import hero1 from '../../../assets/hero-1.jpg';
import hero2 from '../../../assets/hero-2.jpg';
import hero3 from '../../../assets/hero-3.jpg';
import comicCreation from '../../../assets/comic-creation-square.png';
import videoCreation from '../../../assets/video-creation.jpg';
import ocDressUp from '../../../assets/oc-dress-up.png';
import infiniteCanvas from '../../../assets/infinite-canvas.jpg';
import miniTools from '../../../assets/mini-tools-arcade.png';

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
