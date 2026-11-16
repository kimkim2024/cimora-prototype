import { useEffect } from 'react';

/** Route change → top of the page. */
export function scrollToTop() {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
}

/**
 * Safety net for wheel scrolling.
 *
 * On a few setups the browser silently drops wheel-driven scrolling (heavy
 * compositing, an extension, a trackpad driver reporting a different axis,
 * an occluded tab where the animation frames are paused). The event still
 * arrives, nothing calls preventDefault, and nothing moves. So: when a wheel
 * gesture happens and the scroller under the pointer did not move by the next
 * frame, move it ourselves. When the browser did scroll, this does nothing.
 *
 * The same logic lives in `cimora-scroll-guard.js` at the repo root, so both
 * prototypes behave like the app.
 */

function lineHeightFactor(event: WheelEvent) {
  if (event.deltaMode === 1) return 16; // lines
  if (event.deltaMode === 2) return window.innerHeight; // pages
  return 1; // pixels
}

function documentScroller(): Element | null {
  return document.scrollingElement ?? document.documentElement;
}

function maxScrollTop(target: Element) {
  const height = target === documentScroller() ? window.innerHeight : target.clientHeight;
  return Math.max(0, target.scrollHeight - height);
}

/**
 * The scroller that should receive this wheel: the nearest scrollable ancestor
 * with room left in the gesture's direction, else the document. A textarea or a
 * panel keeps its own scrolling; an app shell with an internal pane still
 * scrolls even when the document itself is viewport-sized.
 */
function scrollTarget(target: EventTarget | null, delta: number): Element | null {
  let node = target instanceof Element ? target : null;
  while (node && node !== document.documentElement && node !== document.body) {
    const style = getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) {
      const atTop = node.scrollTop <= 0;
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
      if (!((delta < 0 && atTop) || (delta > 0 && atBottom))) return node;
    }
    node = node.parentElement;
  }
  const scroller = documentScroller();
  if (scroller && scroller.scrollHeight > scroller.clientHeight + 1) return scroller;
  return null;
}

type Batch = {
  target: Element;
  before: number;
  delta: number;
  startedAt: number;
  done: boolean;
};

export function useWheelScrollFallback() {
  useEffect(() => {
    let pending: Batch | null = null;

    const apply = (batch: Batch) => {
      if (batch.done) return;
      batch.done = true;
      if (pending === batch) pending = null;

      const target = batch.target;
      // The browser moved it after all.
      if (Math.abs(target.scrollTop - batch.before) >= 1) return;

      const next = Math.max(0, Math.min(maxScrollTop(target), batch.before + batch.delta));
      if (Math.abs(next - batch.before) < 1) return; // already at the end

      try {
        target.scrollTo({ top: next, left: target.scrollLeft, behavior: 'instant' as ScrollBehavior });
      } catch {
        target.scrollTop = next;
      }
      if (Math.abs(target.scrollTop - next) >= 1) target.scrollTop = next;
    };

    const schedule = (batch: Batch) => {
      let fired = false;
      const run = () => {
        if (fired) return;
        fired = true;
        apply(batch);
      };
      // two frames: let the browser's own (often animated) scroll start
      requestAnimationFrame(() => requestAnimationFrame(run));
      // watchdog: animation frames are paused in an occluded tab, and a batch
      // that never runs must not swallow every later gesture
      setTimeout(run, 60);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return; // pinch-zoom / browser gestures
      const delta = event.deltaY * lineHeightFactor(event);
      if (!delta) return;

      const target = scrollTarget(event.target, delta);
      if (!target) return;

      const now = performance.now();
      if (pending && !pending.done) {
        if (pending.target === target && now - pending.startedAt < 220) {
          pending.delta += delta; // fold a burst of wheel events into one step
          return;
        }
        apply(pending); // another scroller, or a stale batch from a paused frame
      }

      pending = { target, before: target.scrollTop, delta, startedAt: now, done: false };
      schedule(pending);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);
}
