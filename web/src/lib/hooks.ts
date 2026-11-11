import { useEffect, useRef, useState } from 'react';

/** true once the element has been on screen; the observer disconnects itself. */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver !== 'function') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, threshold]);

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
