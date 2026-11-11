/*
 * Scroll guard: keep the page scrollable when the browser drops wheel scrolling.
 *
 * On some machines (a Chrome build with a stuck smooth-scroll feature, an
 * extension, a trackpad driver) the wheel event reaches the document, nobody
 * calls preventDefault, and the page still does not move - while
 * window.scrollTo() works fine. The React app carries the same guard in
 * web/src/lib/scroll.ts; this is the plain-JS twin so the prototype behaves the
 * same way.
 *
 * The rule: when a wheel gesture happens and neither the browser nor a nested
 * scroller moved by the next two frames, scroll the page ourselves. When the
 * browser did scroll, this does nothing.
 */
(function () {
  if (window.__cimoraScrollGuard) return;
  window.__cimoraScrollGuard = true;

  var pending = null; // { before, delta, seenScroll }
  var quietUntil = 0; // ignore the scroll events our own scrollTo() causes

  function deltaFactor(event) {
    if (event.deltaMode === 1) return 16; // lines
    if (event.deltaMode === 2) return window.innerHeight; // pages
    return 1; // pixels
  }

  function canScrollInside(target, delta) {
    var node = target && target.nodeType === 1 ? target : null;
    while (node && node !== document.documentElement) {
      var style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) {
        var atTop = node.scrollTop <= 0;
        var atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
        if (!((delta < 0 && atTop) || (delta > 0 && atBottom))) return true;
      }
      node = node.parentElement;
    }
    return false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (pending && performance.now() > quietUntil) pending.seenScroll = true;
    },
    { passive: true }
  );

  window.addEventListener(
    'wheel',
    function (event) {
      if (event.ctrlKey || event.metaKey) return; // pinch zoom
      var scroller = document.scrollingElement || document.documentElement;
      if (!scroller) return;

      var delta = event.deltaY * deltaFactor(event);
      if (!delta) return;
      if (canScrollInside(event.target, delta)) return; // a panel keeps its own scroll

      // fold a burst of wheel events into one step
      if (pending) {
        pending.delta += delta;
        return;
      }

      pending = { before: scroller.scrollTop, delta: delta, seenScroll: false };
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var batch = pending;
          pending = null;
          if (!batch) return;
          if (batch.seenScroll) return; // the browser scrolled
          if (Math.abs(scroller.scrollTop - batch.before) >= 1) return; // already moving

          var max = Math.max(0, scroller.scrollHeight - window.innerHeight);
          var next = Math.max(0, Math.min(max, batch.before + batch.delta));
          if (Math.abs(next - batch.before) < 1) return; // at the end of the page

          quietUntil = performance.now() + 40;
          try {
            window.scrollTo({ top: next, left: 0, behavior: 'instant' });
          } catch (error) {
            window.scrollTo(0, next);
          }
        });
      });
    },
    { passive: true }
  );
})();
