import { useCallback, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ParticlesField } from '../components/effects/ParticlesField';

/**
 * Placeholder art for the running image columns: the six portraits that shipped
 * with the awwwards template (MIT, xkintaro/kintarowwwards). They are here so the
 * composition can be judged - swap the two arrays for Cimora stills before this
 * goes anywhere public.
 */
const TRACK_A = [
  '/hero-slider/makise-kurisu-2.webp',
  '/hero-slider/atam-1.webp',
  '/hero-slider/kintaro-2.webp',
  '/hero-slider/makise-kurisu-1.webp',
  '/hero-slider/atam-2.webp',
  '/hero-slider/kintaro-1.webp',
];
const TRACK_B = [...TRACK_A].reverse();
const TRACK_C = [...TRACK_A.slice(2), ...TRACK_A.slice(0, 2)];

const track = (list: string[]) => [...list, ...list];

/** each column runs in its own direction and tempo so the band never pulses */
const COLUMNS = [
  { images: track(TRACK_A), from: '0%', to: '-50%', duration: 32 },
  { images: track(TRACK_B), from: '-50%', to: '0%', duration: 38 },
  { images: track(TRACK_C), from: '0%', to: '-50%', duration: 27 },
];

type HeroSpotlightProps = {
  title: string;
  titleTail?: string;
  description: string;
  ctaText: string;
  ctaTo: string;
};

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h13" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function MouseGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
      <rect x="7" y="3" width="10" height="18" rx="5" />
      <path d="M12 7v3" />
    </svg>
  );
}

/**
 * The product hero, rebuilt on the awwwards-portfolio pattern: drifting dust, two
 * columns of running portraits, a very large uppercase headline, and a
 * scroll-linked exit where the next section rises over it.
 *
 * Light-theme adaptation: the dust is ink, the columns sit at low opacity over
 * paper, and the headline drops the original `mix-blend-difference` (it needs a
 * dark ground to read).
 */
export function HeroSpotlight({ title, titleTail, description, ctaText, ctaTo }: HeroSpotlightProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, [0, 800], [1, 0]);
  const scale = useTransform(scrollY, [0, 800], [1, 0.94]);
  const y = useTransform(scrollY, [0, 800], [0, -150]);
  const blur = useTransform(scrollY, [0, 800], [0, 10]);
  const filter = useTransform(blur, (value) => `blur(${value}px)`);

  const style = reduced ? undefined : { opacity, scale, y, filter };

  const scrollToLine = useCallback(() => {
    document.getElementById('production-line-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section
      ref={ref}
      id="home"
      className="sticky top-[72px] flex min-h-[calc(100svh-72px)] w-full flex-col overflow-hidden bg-paper px-6 pt-16 pb-12 wide:px-16 wide:pb-16 mega:px-24"
    >
      <ParticlesField />

      {/* two columns of running portraits, faded into the page on three sides */}
      <motion.div
        style={reduced ? undefined : { opacity }}
        className="pointer-events-none absolute top-0 right-0 bottom-0 z-[5] flex w-[50%] max-w-[720px] select-none gap-3 overflow-hidden px-2 wide:gap-4 mega:max-w-[880px]"
      >
        {COLUMNS.map((column, columnIndex) => (
          <div key={columnIndex} className="relative h-full flex-1 overflow-hidden">
            <motion.div
              className="flex flex-col gap-3 pt-4 wide:gap-4"
              animate={reduced ? undefined : { y: [column.from, column.to] }}
              transition={reduced ? undefined : { ease: 'linear', duration: column.duration, repeat: Infinity }}
            >
              {column.images.map((src, index) => (
                <div
                  key={`${columnIndex}-${index}`}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-[28px] border border-hairline/60"
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center opacity-[0.3] grayscale contrast-[1.06] brightness-[0.8]"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-paper via-transparent to-paper" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[22%] bg-gradient-to-r from-paper to-transparent" />
      </motion.div>

      <motion.div style={style} className="relative z-20 flex w-full flex-1 flex-col gap-10 will-change-[opacity,transform,filter] xl:gap-14">
        <div className="flex w-full items-start justify-between">
          <div className="pointer-events-none rotate-90 select-none text-4xl font-black tracking-tighter text-ink/10 wide:text-6xl" aria-hidden>
            ////
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative h-12 w-px overflow-hidden bg-hairline">
              <motion.div
                className="absolute top-0 left-0 h-1/2 w-full bg-ink"
                animate={reduced ? undefined : { y: ['0%', '100%', '0%'] }}
                transition={reduced ? undefined : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <span className="type-micro font-mono tracking-[0.3em] text-ink-quiet uppercase [writing-mode:vertical-lr]">
              Scroll down
            </span>
          </div>
        </div>

        <div className="mt-auto w-full wide:max-w-[54%] ultra:max-w-[50%]">
          <div className="overflow-hidden">
            <h1 className="max-w-none text-balance font-display text-[46px] leading-[0.86] font-black tracking-[-0.035em] text-ink uppercase wide:text-[72px] ultra:text-[92px] mega:text-[112px]">
              {title}
              {titleTail ? (
                <>
                  <br />
                  <span className="text-ink/70">{titleTail}</span>
                </>
              ) : null}
            </h1>
          </div>
        </div>

        <div className="space-y-6 xl:space-y-7 wide:max-w-[54%] ultra:max-w-[50%]">
          <p className="max-w-[46ch] text-pretty type-lead leading-relaxed font-light text-ink-muted">{description}</p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={ctaTo}
              className="group relative inline-flex h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-ink bg-ink px-6 type-meta font-semibold tracking-[0.15em] text-ink-inverse uppercase shadow-lg transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-ink/30 hover:bg-paper hover:text-ink xl:h-16 xl:px-10 xl:text-[13px]"
            >
              <span className="absolute inset-0 flex h-full w-full -translate-x-full -skew-x-12 justify-center transition-transform duration-700 group-hover:translate-x-full">
                <span className="relative h-full w-8 bg-ink/10" />
              </span>
              <span className="relative z-10 flex items-center gap-2 xl:gap-3">
                {ctaText}
                <span className="transition-transform duration-500 group-hover:translate-x-1">
                  <ArrowGlyph />
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={scrollToLine}
              className="group inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-transparent px-6 type-meta font-semibold tracking-[0.15em] text-ink-muted uppercase backdrop-blur-sm transition-all duration-500 hover:border-hairline hover:bg-paper-muted/60 hover:text-ink xl:h-16 xl:px-10 xl:text-[13px]"
            >
              <span className="flex items-center gap-2 xl:gap-3">
                <span className="opacity-50 transition-opacity group-hover:opacity-100">
                  <MouseGlyph />
                </span>
                See the production line
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
