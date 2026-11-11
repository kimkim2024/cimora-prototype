/** Public site content, carried over from the prototype (`site-data.js`). */

export type Tool = {
  id: string;
  title: string;
  group: string;
  stage: string;
  desc: string;
  art: number;
  asset: string;
};

export const TOOL_GROUPS = [
  'All',
  'Character Assets',
  'Comic Editing',
  'Motion Performance',
  'Story Creation',
  'Studio Efficiency',
] as const;

export const TOOLS: Tool[] = [
  {
    id: 'panel-splitter',
    title: 'Comic Panel Split & OCR',
    group: 'Comic Editing',
    stage: 'P0',
    desc: 'Turn one long image into an ordered storyboard with dialogue.',
    art: 0,
    asset: 'Storyboard',
  },
  {
    id: 'comic-to-motion',
    title: 'Panel to Video',
    group: 'Motion Performance',
    stage: 'P0',
    desc: 'Add camera moves, raindrops and dialogue to a still image and preview a 10-second story.',
    art: 1,
    asset: 'Shot',
  },
  {
    id: 'consistency-check',
    title: 'Character Consistency Check',
    group: 'Character Assets',
    stage: 'P0',
    desc: 'Compare against your character reference to catch differences in hair, outfit and identity.',
    art: 2,
    asset: 'QA report',
  },
  {
    id: 'oc-sheet',
    title: 'OC Character Sheet',
    group: 'Character Assets',
    stage: 'P0',
    desc: 'Give the character in your mind a reusable identity card.',
    art: 1,
    asset: 'Character',
  },
  {
    id: 'pngtuber',
    title: 'PNGTuber Maker',
    group: 'Motion Performance',
    stage: 'P1',
    desc: 'Four core states to let your character talk with you.',
    art: 8,
    asset: 'Character',
  },
  {
    id: 'expressions',
    title: 'Expression & Pose Maker',
    group: 'Character Assets',
    stage: 'P1',
    desc: 'Keep the same character and explore different moods and poses.',
    art: 1,
    asset: 'Expressions',
  },
  {
    id: 'lettering',
    title: 'Dialogue Cleanup & Lettering',
    group: 'Comic Editing',
    stage: 'P1',
    desc: 'Remove old dialogue, translate it and letter it back into the art.',
    art: 3,
    asset: 'Panel',
  },
  {
    id: 'colorize',
    title: 'Line Art Cleanup & Coloring',
    group: 'Comic Editing',
    stage: 'P1',
    desc: 'Keep the personality of your lines and let color become part of the story.',
    art: 6,
    asset: 'Panel',
  },
  {
    id: 'live2d-layers',
    title: 'Live2D Layer Assistant',
    group: 'Character Assets',
    stage: 'P1',
    desc: 'Review character layers and find where to redraw or split.',
    art: 1,
    asset: 'Layer data',
  },
  {
    id: 'storyboard',
    title: 'Consistent Storyboard',
    group: 'Story Creation',
    stage: 'P2',
    desc: 'Use the same cast to find the right shots for consecutive scenes.',
    art: 0,
    asset: 'Storyboard',
  },
  {
    id: 'live2d-rig',
    title: 'Live2D Rigging Assistant',
    group: 'Motion Performance',
    stage: 'P2',
    desc: 'From layer checks to motion parameters, spot rigging gaps early.',
    art: 8,
    asset: 'Rigging data',
  },
  {
    id: 'continuity',
    title: 'Cross-Chapter Continuity Check',
    group: 'Studio Efficiency',
    stage: 'P2',
    desc: 'Track outfits, props and plot state so your story stays consistent.',
    art: 4,
    asset: 'QA report',
  },
  {
    id: 'motion-quality',
    title: 'Automatic Video QA',
    group: 'Studio Efficiency',
    stage: 'P2',
    desc: 'Before delivery, check black frames, subtitle safe areas and audio-video issues.',
    art: 7,
    asset: 'QA report',
  },
  {
    id: 'batch-assets',
    title: 'Batch Asset Processing',
    group: 'Studio Efficiency',
    stage: 'P2',
    desc: 'Organize many files at once with unified names, sizes and asset ownership.',
    art: 6,
    asset: 'Asset set',
  },
];

export type CaseStudy = {
  id: string;
  title: string;
  tag: string;
  subtitle: string;
  art: number;
  shots: number;
  seconds: number;
};

export const CASES: CaseStudy[] = [
  {
    id: 'rain',
    title: 'Before the Rain Ends',
    tag: 'Urban romance',
    subtitle: 'An unsent letter and a reunion seven years late.',
    art: 6,
    shots: 10,
    seconds: 48,
  },
  {
    id: 'bookshop',
    title: 'Slow Days Bookshop',
    tag: 'Healing daily life',
    subtitle: 'At the city corner, gathering tenderness that was forgotten.',
    art: 0,
    shots: 8,
    seconds: 36,
  },
  {
    id: 'afterlight',
    title: 'Letters of Faint Light',
    tag: 'Character short',
    subtitle: 'Dusk settles in her eyes, and the story has only just begun.',
    art: 8,
    shots: 12,
    seconds: 54,
  },
];

export type Template = {
  id: string;
  title: string;
  type: string;
  desc: string;
  art: number;
};

export const TEMPLATE_TYPES = ['All', 'Camera Move', 'Webtoon', 'Character', 'Promo'] as const;

export const TEMPLATES: Template[] = [
  { id: 'gentle-motion', title: 'Slow push-in · emotional close-up', type: 'Camera Move', desc: 'Leave room to breathe for dialogue and inner monologue.', art: 1 },
  { id: 'rain-story', title: 'Rainy-day sketch · webtoon layout', type: 'Webtoon', desc: 'Muted gray-blue, generous white space, warm dialogue.', art: 6 },
  { id: 'oc-profile', title: 'OC character sheet', type: 'Character', desc: 'Look, outfit, personality and multiple views on one card.', art: 8 },
  { id: 'chapter-trailer', title: '15 sec · chapter trailer', type: 'Promo', desc: 'Three emotional shots to draw viewers into the next chapter.', art: 7 },
  { id: 'dialogue-scene', title: 'Two-person dialogue · shot rhythm', type: 'Camera Move', desc: 'Build the bond, answer the emotion, keep the silence.', art: 4 },
  { id: 'warm-cover', title: 'Dusk · chapter cover', type: 'Promo', desc: 'Design a restrained release cover for your work.', art: 9 },
];

export type Article = {
  id: string;
  title: string;
  category: string;
  time: string;
  art: number;
  steps: string[];
};

export const ARTICLES: Article[] = [
  {
    id: 'first-chapter',
    title: 'From one story to your first comic chapter',
    category: 'Getting started',
    time: '6 min',
    art: 0,
    steps: [
      'Outline the chapter goal and closing hook',
      'Define main characters, scenes and art style',
      'Confirm the storyboard, then generate panel by panel and refine locally',
      'Pace the reading with white space, then export chapter 1',
    ],
  },
  {
    id: 'consistent-characters',
    title: 'Keeping your character looking like themselves in every panel',
    category: 'Characters & assets',
    time: '5 min',
    art: 1,
    steps: [
      'Build a character reference set with hair and outfit rules',
      'Lock asset versions to avoid silent changes',
      'Use consistency checks to pinpoint issues',
      'Fix locally first, redo the whole panel only if needed',
    ],
  },
  {
    id: 'stable-motion',
    title: 'Limited animation can still tell a great story',
    category: 'Video production',
    time: '8 min',
    art: 6,
    steps: [
      'Keep a stable animation base for every shot',
      'Let camera moves and timing serve the emotion',
      'Enhance only the shots that truly need complex motion',
      'Check subtitle safe areas before final approval',
    ],
  },
  {
    id: 'release-kit',
    title: 'Prepare a promo kit for the next chapter',
    category: 'Work promotion',
    time: '4 min',
    art: 7,
    steps: [
      'Pick the frames that best represent the chapter',
      'Create character cards, before-and-after comparisons and chapter covers',
      'Check title safe areas at each channel size',
      'Preview the read-only share page, then export assets',
    ],
  },
];

export const FAQS: [string, string][] = [
  [
    'Can I make just a comic, without animation?',
    'Yes. Comics can be exported on their own, or you can keep going with video in the same project, reusing your character and scene assets.',
  ],
  [
    'If generative enhancement fails, do I lose my existing animation?',
    'No. The stable base is always kept separately, and enhanced candidates only enter the chapter once you adopt them.',
  ],
  [
    'Does the subscription include model usage?',
    'This prototype shows billing with subscription and external model usage kept separate. All amounts are plan examples, and nothing is charged.',
  ],
  [
    'Do free tools require login?',
    'You can try sample results anonymously first. A simulated login is used only when you save assets or add to a project, and your results are kept.',
  ],
  [
    'Are my files uploaded or used for training?',
    'This prototype previews files locally only and calls no external models. Data and training policies of the live service follow the officially published terms.',
  ],
  [
    'Can results generated here be used commercially?',
    'This prototype shows only original sample art and workflows. Real assets must be rights-cleared by the user, and live results must also follow the model provider license.',
  ],
];

export type Feature = {
  id: string;
  tag: string;
  title: string;
  desc: string;
  art: number;
  source: string;
  steps: string[];
  points: string[];
  tools: string[];
};

export const FEATURES: Feature[] = [
  {
    id: 'webtoon',
    tag: 'Webtoon creation',
    title: 'Your story deserves to be drawn panel by panel.',
    desc: 'From ideas and novels to full stories: confirm the narrative first, then bring characters into the frame.',
    art: 1,
    source: 'idea',
    steps: [
      'Organize standard chapter content',
      'Confirm characters, scenes and style',
      'Generate panel by panel and fix locally',
      'Arrange reading rhythm and export',
    ],
    points: [
      'Characters and outfits share versions, so continuous frames stay consistent.',
      'Speech bubbles, narration and sound effects are edited separately from the art.',
      'No need to regenerate a satisfying frame for one expression.',
    ],
    tools: ['oc-sheet', 'lettering', 'colorize'],
  },
  {
    id: 'motion-comic',
    tag: 'Motion comic production',
    title: 'Not just moving images: give emotion a rhythm.',
    desc: 'Camera moves, dialogue, subtitles and limited animation form a stable draft. Key actions are left to the enhanced candidates you pick.',
    art: 6,
    source: 'comic',
    steps: [
      'Import or reuse comic panels',
      'Plan shot length and camera moves',
      'Compare key-action enhancement candidates',
      'Check audio, visuals and subtitles, then approve export',
    ],
    points: [
      'Stable animation is never overwritten by enhancements, and failures can still be delivered.',
      'Edit shot by shot, with every parameter and adoption recorded.',
      'After a comic edit, confirm the affected shots and sync them locally.',
    ],
    tools: ['comic-to-motion', 'motion-quality', 'pngtuber'],
  },
  {
    id: 'studio',
    tag: 'Studio workflow',
    title: 'A studio world should remember every detail.',
    desc: 'Projects, assets, versions, quality and budget in one place. Make continuous production clearer.',
    art: 0,
    source: 'script',
    steps: [
      'Build a shared asset library',
      'Schedule tasks by chapter',
      'Review version differences one by one',
      'Confirm costs and delivery versions',
    ],
    points: [
      'See at a glance where characters, props and outfits are used.',
      'Failed tasks can be located and retried without redoing the whole chapter.',
      'Team comments and approvals are an advanced interaction demo; real services will be built in phases.',
    ],
    tools: ['continuity', 'motion-quality', 'batch-assets'],
  },
];

export type Plan = {
  name: string;
  tag: string;
  monthly: number;
  yearly: number;
  note: string;
  items: string[];
};

export const PLANS: Plan[] = [
  {
    name: 'Free',
    tag: 'Start with a small tool',
    monthly: 0,
    yearly: 0,
    note: 'No payment details needed',
    items: ['Try demo tools anonymously', 'One demo workspace', 'Showcase and templates', 'Download local results'],
  },
  {
    name: 'Creator',
    tag: 'Keep your own story growing',
    monthly: 19,
    yearly: 15,
    note: 'Model usage billed separately, with an estimate shown before each call',
    items: [
      'Indie creator projects and assets',
      'Comic and video in one',
      'Local edits and version history',
      'Budget and generation records',
    ],
  },
  {
    name: 'Studio',
    tag: 'Designed for a team world',
    monthly: 59,
    yearly: 47,
    note: 'Model usage billed separately, with an estimate shown before each call',
    items: [
      'Studio projects and shared assets',
      'Member and seat setup demo',
      'Diff review and batch delivery',
      'Quality, task and cost dashboard',
    ],
  },
];

export const HELP_CATEGORIES = [
  { title: 'Story & storyboard', articleId: 'first-chapter' },
  { title: 'Characters & assets', articleId: 'consistent-characters' },
  { title: 'Animation & export', articleId: 'stable-motion' },
  { title: 'Promotion & sharing', articleId: 'release-kit' },
];

export const LEGAL_TITLES: Record<string, string> = {
  privacy: 'Privacy & data',
  copyright: 'Commercial use & copyright',
  terms: 'Terms of service',
  content: 'Content & voice policy',
};

export const LEGAL_NOTICE =
  'This page reviews what the official product should disclose and does not represent service commitments already live. This prototype collects no real account credentials, calls no models, and performs no payments or external publishing.';

export const LEGAL_SECTIONS: [string, string][] = [
  [
    'Local demo data',
    'Demo projects, settings and tool results are saved in the current browser. You can export or reset them in Studio settings. Uploaded materials are previewed locally only and never sent to external vendors.',
  ],
  [
    'Rights to materials and generated results',
    'Users must hold the rights to uploaded materials. The official service must detail vendor licenses, commercial use scope, copyright claims, DMCA handling and infringement complaint channels. Demo illustrations are original local artwork.',
  ],
  [
    'Data use and retention',
    'Before launch, it must be clear whether materials are used for training, processing purposes, retention periods, deletion flow, vendor processing scope and GDPR data export. The prototype does not imply these operations are complete.',
  ],
  [
    'Voice and content boundaries',
    'The prototype does not clone real people voices. The official service must define voice authorization, minors, NSFW and illegal content boundaries, and a subscription cannot replace material or voice authorization.',
  ],
  [
    'Subscription, fees and termination',
    'Amounts and plans on this page are samples; actions create no contract or charge. Billing, refunds, cancellation, quotas and vendor-failure charges in the official service follow the official agreement.',
  ],
];

export const UPDATES: [string, string, string][] = [
  ['2026.10.28', 'Site-wide creative experience', 'The website, 14 tools, projects, assets and promotion sharing all live in one prototype.'],
  ['2026.10.28', 'Every version has a source', 'Added parameter history, restore as new version, focus canvas and timeline positioning.'],
  ['2026.10.27', 'Start from one chapter', 'Built the five-step workspace for comics and video.'],
];
