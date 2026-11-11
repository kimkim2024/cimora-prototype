import { useEffect, useRef, useState } from 'react';

/**
 * true once the element has been reached by the reader.
 *
 * This deliberately does not use IntersectionObserver. An observer fires when
 * the *ratio* changes, so an element that goes from below the fold to above it
 * in a single jump (a fast flick, an instant scroll, a wheel fallback step)
 * reports "0 before, 0 after" and never calls back - the content then stays
 * invisible until the reader scrolls back up. A scroll check answers the only
 * question that matters: has the top of the element reached the viewport?
 */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let done = false;

    const stop = () => {
      done = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    const measure = () => {
      frame = 0;
      if (done || !el.isConnected) return;
      if (el.getBoundingClientRect().top < window.innerHeight) {
        stop();
        setInView(true);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure(); // already on screen, or already passed
    if (!done) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      stop();
    };
  }, [inView]);

  return [ref, inView] as const;
}

/** Tracks `(prefers-reduced-motion: reduce)`; every motion feature reads this. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return reduced;
}

/**
 * Advances an index 0..count-1 on a timer. Pauses while `paused` is true (a
 * pointer is over the section) and never runs under reduced motion.
 */
export function useAutoCycle(count: number, paused: boolean, reduced: boolean, every = 2800) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (paused || reduced || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), every);
    return () => window.clearInterval(id);
  }, [count, paused, reduced, every]);

  return [index, setIndex] as const;
}
