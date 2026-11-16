/** Showroom, market and creator content, ported from the root prototype's demo data. */

export type Shot = { n: number; framing: string; action: string; line: string };

export type WorkChapter = {
  id: string;
  title: string;
  pages: number;
  free?: boolean;
  price?: number;
  text?: string[];
  shots?: Shot[];
};

export type WorkKind = 'story' | 'comic' | 'motion' | 'image';

export type Work = {
  id: string;
  title: string;
  author: string;
  tag: string;
  art: number;
  desc: string;
  type: 'comic' | 'motion' | 'both';
  kinds: WorkKind[];
  published: string;
  chapters: WorkChapter[];
};

export type PackType = 'Asset pack' | 'Skill' | 'Template' | 'Workflow';

export type Pack = {
  id: string;
  title: string;
  type: PackType;
  category: string;
  art: number;
  price: number;
  author: string;
  desc: string;
  uses: string;
  steps: string[];
  contents?: string[];
  license?: string;
};

export type Publication = {
  id: string;
  title: string;
  author: string;
  chapter: string;
  type: 'comic' | 'motion';
};

export type CreatorDraft = { id: string; title: string; type: string; price: number; listed: boolean };

export const WORKS: Work[] = [
  {
    id: 'rain-public',
    title: 'Before the Rain Stops',
    author: 'Cimora Originals',
    tag: 'Urban romance',
    art: 1,
    desc: 'A letter that was never sent, and a reunion seven years late.',
    type: 'both',
    kinds: ['story', 'comic', 'motion'],
    published: '2026-11-02',
    chapters: [
      {
        id: 'c1',
        title: 'The Seventh Day After',
        pages: 8,
        free: true,
        text: [
          'The forecast said the rain would stop by Thursday. It was already the seventh day, and the street still smelled of wet concrete and closed umbrellas.',
          'Lin Xia stopped in front of the bookshop without deciding to. The sign had been repainted, but the brass handle was the same one she had gripped seven years ago, on the afternoon she said she was leaving.',
          'Through the window she could see the shelf she used to lean against. Someone had put a chair there, as if the shop had learned that people sometimes need to sit down before they can speak.',
          'The door opened. The bell above it had not been replaced either.',
        ],
        shots: [
          { n: 1, framing: 'Wide, street corner', action: 'Rain on the old bookshop sign; Lin Xia stops in the middle of the crossing.', line: 'Narration: the seventh day of rain.' },
          { n: 2, framing: 'Close-up, hands', action: 'Her fingers tighten around the red scarf.', line: 'Narration: she had counted the years in umbrellas.' },
          { n: 3, framing: 'Over-shoulder, window', action: 'She looks in: the chair by the shelf, the light left on.', line: 'No dialogue.' },
          { n: 4, framing: 'Medium close, doorway', action: 'Chen Xu turns around behind the door frame.', line: 'Chen Xu: You came back on a rainy day.' },
          { n: 5, framing: 'Two-shot, interior', action: 'Neither moves; the bell keeps swinging.', line: 'Lin Xia: I was passing by.' },
          { n: 6, framing: 'Wide, interior', action: 'Rain on the glass, two silhouettes and a chair between them.', line: 'Narration: the shop had been waiting longer than either of them.' },
        ],
      },
      {
        id: 'c2',
        title: 'The Unsent Letter',
        pages: 8,
        price: 40,
        text: [
          'The envelope was yellowed at the corners, the way paper goes when it has been carried in a coat pocket for a week and then put away for years.',
          'She did not open it in front of him. She put it on the counter, next to the empty cup he had not cleared, and said the only sentence she had practiced on the way over.',
        ],
        shots: [
          { n: 1, framing: 'Prop close-up', action: 'The envelope lands on the counter; a crease catches the window light.', line: 'Narration: some words waited seven years.' },
          { n: 2, framing: 'Close-up, faces', action: 'Chen Xu looks at the envelope, not at her.', line: 'Chen Xu: You kept it.' },
          { n: 3, framing: 'Medium, counter', action: 'Her hand stays flat on the paper.', line: 'Lin Xia: I never finished it.' },
          { n: 4, framing: 'Two-shot, wide', action: 'The rain gets quieter outside; neither of them moves.', line: 'Narration: this time nobody left first.' },
        ],
      },
      { id: 'c3', title: 'Rain on the Shop Window', pages: 9, price: 40 },
      { id: 'c4', title: 'Under the Same Umbrella', pages: 7, price: 40 },
    ],
  },
  {
    id: 'sky-public',
    title: 'Star Sea Post Office',
    author: 'Yuejian Huiyan',
    tag: 'Fantasy healing',
    art: 5,
    desc: 'She delivers letters for the stars, and is also looking for her own place to belong.',
    type: 'comic',
    kinds: ['story', 'comic'],
    published: '2026-10-24',
    chapters: [
      {
        id: 's1',
        title: 'Letters for the Stars',
        pages: 10,
        free: true,
        text: [
          'The post office opened only when the sky was clear enough to see where the letters had to go.',
          'She sorted them by brightness: the ones that had waited a long time glowed faintly, and those were always the hardest to deliver.',
          'Tonight there was one address she had never seen before, written in her own handwriting.',
        ],
      },
      { id: 's2', title: 'The Address Nobody Found', pages: 9, price: 30 },
    ],
  },
  {
    id: 'book-public',
    title: 'Slow Days Bookshop',
    author: 'Cimora Originals',
    tag: 'Slice of life',
    art: 0,
    desc: 'Between old books and the sound of rain, pick up the tenderness that was forgotten.',
    type: 'comic',
    kinds: ['comic'],
    published: '2026-10-11',
    chapters: [
      { id: 'b1', title: 'The Doorbell in the Rain', pages: 6, free: true },
      { id: 'b2', title: 'A Book Nobody Borrowed', pages: 6, price: 30 },
    ],
  },
  {
    id: 'light-public',
    title: 'Letters in the Glimmer',
    author: 'Mist Island studio',
    tag: 'Mood short',
    art: 2,
    desc: 'Dusk falls into the eyes; the story has only just begun.',
    type: 'motion',
    kinds: ['motion', 'image'],
    published: '2026-09-30',
    chapters: [
      { id: 'v1', title: 'Dusk Into the Eyes', pages: 1, free: true },
      { id: 'v2', title: 'Glimmer, Shot 02', pages: 1, price: 20 },
    ],
  },
];

export const PACKS: Pack[] = [
  {
    id: 'pack-urban-character',
    title: 'Urban Youth Character Pack',
    type: 'Asset pack',
    category: 'Character pack',
    art: 3,
    price: 180,
    author: 'Cimora Originals',
    desc: 'A ready-to-reuse city character: identity, three-view sheet, portraits and outfit variants.',
    uses: 'Drop the character into a story or comic chapter and keep the same face, hair and clothing across panels.',
    steps: ['Read the character sheet and lock the identity you want', 'Pick the outfits and expressions for this chapter', 'Apply the versions to the panels you select'],
    license: 'Use in your own personal and commercial works. Do not resell the pack as-is or redistribute the reference sheets. The creator must confirm any wider licensing.',
    contents: ['Character sheet, front / side / back', 'Two portrait crops for covers and avatars', 'Four outfit references with colour notes', 'One scene-ready lighting note'],
  },
  {
    id: 'pack-night-city',
    title: 'Night City Scene Pack',
    type: 'Asset pack',
    category: 'Scene pack',
    art: 0,
    price: 120,
    author: 'Cimora Originals',
    desc: 'A rainy street corner and an old bookshop, built as a small reusable stage for waiting and reunion scenes.',
    uses: 'Reuse one location across chapters so lighting, props and camera positions stay consistent.',
    steps: ['Choose the street or the interior variant', 'Set the time of day and weather note', 'Apply to the panels that share the location'],
    license: 'Use in your own works, including commercial projects. Do not resell the scene files or publish them as a standalone asset pack.',
    contents: ['Street corner, wide and medium', 'Bookshop interior, two camera angles', 'Rain and window light notes', 'Four prop references'],
  },
  {
    id: 'pack-star-post',
    title: 'Star Sea Post Office World Guide',
    type: 'Asset pack',
    category: 'World guide',
    art: 5,
    price: 90,
    author: 'Yuejian Huiyan',
    desc: 'Rules, tone and visual language for a healing fantasy world where letters travel between stars.',
    uses: 'Start a new story inside this world without rebuilding its rules, tone and palette.',
    steps: ['Read the world rules and the story seeds', 'Pick a seed that fits your chapter', 'Carry the palette and tone into the first storyboard'],
    license: 'Adapt the world for your own stories. Credit the original guide when a work is published. Do not sell the guide itself.',
    contents: ['World rules and tone sheet', 'Six story seeds', 'Palette and lighting reference', 'Three location sketches'],
  },
  {
    id: 'pack-voice-soft',
    title: 'Soft and Clear Voice Set',
    type: 'Asset pack',
    category: 'Voice set',
    art: 2,
    price: 60,
    author: 'Cimora Originals',
    desc: 'Two preset narration voices and one character voice with sample lines, for dialogue and trailers.',
    uses: 'Keep narration consistent across chapters and match a character voice to the same character.',
    steps: ['Listen to the sample lines', 'Pick a voice for narration or a character', 'Apply it to the shots that carry dialogue'],
    license: 'Use the presets in your own works. These are recorded presets, not voice cloning, and cannot be resold.',
    contents: ['Narration voice, calm', 'Narration voice, warm', 'Character voice with four sample lines', 'Mixing notes for dialogue and music'],
  },
  {
    id: 'skill-dialogue-subtext',
    title: 'Give the dialogue its subtext',
    type: 'Skill',
    category: 'Script',
    art: 3,
    price: 40,
    author: 'Cimora Lab',
    desc: 'Rewrite a flat exchange so the characters talk around what they mean.',
    uses: 'Paste a scene, get three subtext-forward versions that keep the same plot beats.',
    steps: ['Paste the exchange you want to keep', 'Pick the tone: restrained, warm or tense', 'Compare candidates and keep one'],
    license: 'Use in your own projects. The prompts stay in your workspace.',
  },
  {
    id: 'template-vertical-chapter',
    title: 'Breathing vertical comic chapter',
    type: 'Template',
    category: 'Layout',
    art: 5,
    price: 0,
    author: 'Cimora Lab',
    desc: 'A chapter rhythm for phones: wide beats, close-ups and one quiet panel.',
    uses: 'Apply the rhythm to a new chapter, then swap the panels.',
    steps: ['Apply the layout to the chapter', 'Fill the panels from your assets', 'Check the scroll rhythm'],
    license: 'Free to use and adapt inside Cimora.',
  },
  {
    id: 'workflow-chapter-to-teaser',
    title: 'From one chapter to a motion teaser',
    type: 'Workflow',
    category: 'Motion',
    art: 4,
    price: 70,
    author: 'Cimora Lab',
    desc: 'Pick three beats from a chapter and turn them into a 20-second teaser.',
    uses: 'Choose a chapter; the workflow proposes three shots and their timing.',
    steps: ['Choose the chapter', 'Confirm the three beats', 'Render a stable draft'],
    license: 'Use in your own projects. Renders are billed by usage, not by this workflow.',
  },
];

export const DRAFTS: CreatorDraft[] = [
  { id: 'draft-1', title: 'Rainy corner lighting note', type: 'Skill', price: 30, listed: false },
];

export const CREATOR_TABS = ['Works', 'Asset packs', 'Earnings'] as const;
export const SHOWCASE_TABS = ['Featured', 'Latest updates', 'Following', 'Saved', 'My publishes'] as const;
export const KINDS: { label: string; value: 'all' | WorkKind }[] = [
  { label: 'All', value: 'all' },
  { label: 'Story', value: 'story' },
  { label: 'Comic', value: 'comic' },
  { label: 'Video', value: 'motion' },
  { label: 'Image and sound', value: 'image' },
];
