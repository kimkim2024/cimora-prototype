import { useEffect } from 'react';

/** Route change → top of the page. */
export function scrollToTop() {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
}

/**
 * Safety net for wheel scrolling.
 *
 * On a few setups the browser silently drops wheel-driven scrolling on the
 * document (heavy compositing, an extension, a stale `scroll-behavior`, a
 * trackpad driver reporting a different axis). The event still arrives, nothing
 * calls preventDefault, and nothing moves. So: when a wheel gesture happens and
 * the page did not move by the next frame, move it ourselves. When the browser
 * did scroll, this does nothing.
 */
function lineHeightFactor(event: WheelEvent) {
  if (event.deltaMode === 1) return 16; // lines
  if (event.deltaMode === 2) return window.innerHeight; // pages
  return 1; // pixels
}

function canScrollInside(target: EventTarget | null, delta: number) {
  let node = target instanceof Element ? target : null;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    const scrollable = /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
    if (scrollable) {
      const atTop = node.scrollTop <= 0;
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
      if (!((delta < 0 && atTop) || (delta > 0 && atBottom))) return true;
    }
    node = node.parentElement;
  }
  return false;
}

export function useWheelScrollFallback() {
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return; // pinch-zoom / browser gestures
      const scroller = document.scrollingElement;
      if (!scroller) return;
      const delta = (event.deltaY + event.deltaX) * lineHeightFactor(event);
      if (!delta) return;
      // a scrollable child (a textarea, a panel) keeps its own scrolling
      if (canScrollInside(event.target, delta)) return;

      const before = scroller.scrollTop;
      requestAnimationFrame(() => {
        if (Math.abs(scroller.scrollTop - before) >= 1) return; // the browser scrolled
        const max = scroller.scrollHeight - window.innerHeight;
        const next = Math.max(0, Math.min(max, before + delta));
        if (next !== before) scroller.scrollTop = next;
      });
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);
}
