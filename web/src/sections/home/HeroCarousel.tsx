import { useCallback, useEffect, useState } from 'react';
import { REEL } from '../../data/home';
import { useReducedMotion } from '../../lib/hooks';

const AUTOPLAY = 6000;

/**
 * The film carousel: one large still in the middle, the neighbours peeking in at
 * the sides, dots underneath. No arrows; autoplay pauses on hover, and the
 * arrow keys work when the carousel has focus.
 */
export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  const go = useCallback((next: number) => setIndex(((next % REEL.length) + REEL.length) % REEL.length), []);

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % REEL.length), AUTOPLAY);
    return () => window.clearInterval(id);
  }, [paused, reduced]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured works"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') go(index - 1);
        if (event.key === 'ArrowRight') go(index + 1);
      }}
      className="container-page pt-16"
    >
      <div className="text-center">
        <h1 className="mx-auto max-w-[26ch] text-[36px] wide:text-[40px] mega:text-[46px] font-medium leading-[1.3] tracking-[-0.02em] text-ink">
          Turn the worlds you love, into your own work.
        </h1>
        <p className="mx-auto mt-3 max-w-[52ch] type-list text-ink-muted">
          From a single spark, to a comic chapter, to a story that moves.
        </p>
      </div>

      <div className="relative mt-10 h-[420px] wide:h-[470px] mega:h-[520px]">
        {REEL.map((film, i) => {
          const offset = (i - index + REEL.length) % REEL.length;
          const state = offset === 0 ? 'current' : offset === 1 ? 'next' : 'previous';
          const placement =
            state === 'current'
              ? 'z-20 translate-x-[-50%] opacity-100'
              : state === 'next'
                ? 'z-10 translate-x-[calc(50%+24px)] scale-[0.94] opacity-40'
                : 'z-10 translate-x-[calc(-150%-24px)] scale-[0.94] opacity-40';

          return (
            <button
              key={film.title}
              type="button"
              aria-label={state === 'current' ? film.title : `Show ${film.title}`}
              aria-current={state === 'current'}
              tabIndex={state === 'current' ? -1 : 0}
              onClick={() => go(i)}
              className={
                'absolute left-1/2 top-0 h-full w-[min(940px,76vw)] wide:w-[min(1040px,72%)] mega:w-[min(1180px,70%)] overflow-hidden rounded-2xl border border-hairline bg-paper-sunken text-left transition-all duration-500 ' +
                placement
              }
            >
              <img
                src={film.cover}
                alt=""
                style={{ objectPosition: film.position }}
                className="h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(17,16,28,.82)_0%,rgba(24,18,41,.28)_42%,transparent_70%)]" />

              <span className="absolute left-6 top-5 flex items-center gap-2 type-label uppercase tracking-[0.16em] text-ink-inverse/85">
                {film.en}
              </span>
              <span className="absolute right-6 top-5 type-label tabular-nums tracking-[0.1em] text-ink-inverse/85">
                {String(i + 1).padStart(2, '0')} / {String(REEL.length).padStart(2, '0')}
              </span>

              <span className="absolute inset-x-6 bottom-6 block">
                <span className="block text-[40px] font-medium leading-[1.1] tracking-[-0.02em] text-ink-inverse">
                  {film.title}
                </span>
                <span className="mt-2 block max-w-[52ch] type-copy leading-[1.6] text-ink-inverse/80">{film.line}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {REEL.map((film, i) => (
          <button
            key={film.title}
            type="button"
            aria-label={`Switch to ${film.title}`}
            aria-pressed={i === index}
            onClick={() => go(i)}
            className="group grid h-6 w-6 place-items-center"
          >
            <span
              className={
                'block h-[5px] rounded-full transition-all duration-300 ' +
                (i === index ? 'w-[22px] bg-ink' : 'w-[5px] bg-hairline-strong group-hover:bg-ink-muted')
              }
            />
          </button>
        ))}
      </div>
    </section>
  );
}
