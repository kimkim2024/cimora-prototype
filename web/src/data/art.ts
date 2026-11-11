import s0 from '../../../assets/cimora-story-0.webp';
import s1 from '../../../assets/cimora-story-1.webp';
import s2 from '../../../assets/cimora-story-2.webp';
import s3 from '../../../assets/cimora-story-3.webp';
import s4 from '../../../assets/cimora-story-4.webp';
import s5 from '../../../assets/cimora-story-5.webp';

/** Same preset material the prototype uses, addressed by index. */
const FILES = [s0, s1, s2, s3, s4, s5];
const MAP = [0, 1, 2, 3, 2, 4, 4, 0, 5, 4];

export const artUrl = (index = 0) => FILES[MAP[((index % 10) + 10) % 10]];
