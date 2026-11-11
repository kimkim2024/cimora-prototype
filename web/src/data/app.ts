export type Chapter = { id: string; title: string; status: string; seconds: number };

export type Project = {
  id: string;
  name: string;
  desc: string;
  art: number;
  mode: string;
  updated: string;
  chapters: Chapter[];
};

/** The demo project the prototype seeds on first run. */
export const PROJECTS: Project[] = [
  {
    id: 'rain',
    name: 'Before the Rain Ends',
    desc: 'Urban romance · a reunion seven years late',
    art: 6,
    mode: 'studio',
    updated: 'Just now',
    chapters: [
      { id: 'ch1', title: 'The seventh day after', status: 'In progress', seconds: 48 },
      { id: 'ch2', title: 'The unsent letter', status: 'Script draft', seconds: 0 },
    ],
  },
];

export const ASSET_COUNT = 6;
