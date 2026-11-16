/*
 * Scroll guard: keep scrolling working when the browser drops wheel gestures.
 *
 * On some machines (a Chrome build with a stuck smooth-scroll feature, an
 * extension, a trackpad driver) the wheel event reaches the document, nobody
 * calls preventDefault, and nothing moves - while Element.scrollTo() works
 * fine. The React app carries the same guard in web/src/lib/scroll.ts; this is
 * the plain-JS twin so the prototype behaves the same way.
 *
 * The rule: when a wheel gesture happens and the scroller under the pointer did
 * not move by the next frame, scroll it ourselves. When the browser did scroll,
 * this does nothing.
 *
 * Four rules learned the hard way:
 *  1. Installation must be idempotent, not one-shot. The imported build
 *     document.open()s and document.write()s the whole app shell ~120 ms after
 *     load, and Chrome drops every window listener in the process. So the
 *     handlers live on window: re-attaching the same function is a no-op when
 *     it is still registered, and restores the guard when it is not.
 *  2. A batch must never be able to wedge the guard. requestAnimationFrame is
 *     paused in occluded/background tabs, so every batch also carries a
 *     setTimeout watchdog, and a batch older than ~220 ms is flushed instead of
 *     absorbing new gestures forever.
 *  3. `behavior: 'instant'` bypasses CSS `scroll-behavior: smooth` (the imported
 *     build sets it on <html>), where a plain window.scrollTo() animates and
 *     reads back as 0.
 *  4. Inner panes matter: following the wheel target to its nearest scrollable
 *     ancestor is the difference between a scrollable page and a scrollable app
 *     shell, because on these machines native wheel scrolling fails for every
 *     container, not just the document.
 */
(function () {
  var state = window.__cimoraScrollState;
  if (!state) {
    state = window.__cimoraScrollState = {
      pending: null,
      quietUntil: 0,
      onScroll: null,
      onWheel: null
    };
  }

  function deltaFactor(event) {
    if (event.deltaMode === 1) return 16; // lines
    if (event.deltaMode === 2) return window.innerHeight; // pages
    return 1; // pixels
  }

  function documentScroller() {
    return document.scrollingElement || document.documentElement;
  }

  function maxScrollTop(target) {
    var height = target === documentScroller() ? window.innerHeight : target.clientHeight;
    return Math.max(0, target.scrollHeight - height);
  }

  // The scroller that should receive this wheel: the nearest scrollable
  // ancestor with room left in the gesture's direction, else the document.
  function scrollTarget(target, delta) {
    var node = target && target.nodeType === 1 ? target : null;
    while (node && node !== document.documentElement && node !== document.body) {
      var style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) {
        var atTop = node.scrollTop <= 0;
        var atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
        if (!((delta < 0 && atTop) || (delta > 0 && atBottom))) return node;
      }
      node = node.parentElement;
    }
    var scroller = documentScroller();
    if (scroller && scroller.scrollHeight > scroller.clientHeight + 1) return scroller;
    return null;
  }

  function apply(batch) {
    if (!batch || batch.done) return;
    batch.done = true;
    if (state.pending === batch) state.pending = null;

    var target = batch.target;
    if (!target) return;
    if (Math.abs(target.scrollTop - batch.before) >= 1) return; // the browser moved it

    var next = Math.max(0, Math.min(maxScrollTop(target), batch.before + batch.delta));
    if (Math.abs(next - batch.before) < 1) return; // already at the end

    state.quietUntil = performance.now() + 40;
    try {
      target.scrollTo({ top: next, left: target.scrollLeft, behavior: 'instant' });
    } catch (error) {
      target.scrollTop = next;
    }
    if (Math.abs(target.scrollTop - next) >= 1) {
      try {
        target.scrollTop = next;
      } catch (error) {
        /* nothing left to try */
      }
    }
  }

  function schedule(batch) {
    var fired = false;
    function run() {
      if (fired) return;
      fired = true;
      apply(batch);
    }
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(function () {
        requestAnimationFrame(run);
      });
    }
    setTimeout(run, 60); // watchdog: rAF is paused while the tab is occluded
  }

  function handleScroll() {
    if (state.pending && performance.now() > state.quietUntil) state.pending.seenScroll = true;
  }

  function handleWheel(event) {
    if (event.ctrlKey || event.metaKey) return; // pinch zoom
    var delta = event.deltaY * deltaFactor(event);
    if (!delta) return;

    var target = scrollTarget(event.target, delta);
    if (!target) return;

    var now = performance.now();
    var pending = state.pending;
    if (pending && !pending.done) {
      if (pending.target === target && now - pending.startedAt < 220) {
        pending.delta += delta; // fold a burst of wheel events into one step
        return;
      }
      apply(pending); // other scroller, or a stale batch from a paused frame
    }

    state.pending = {
      target: target,
      before: target.scrollTop,
      delta: delta,
      startedAt: now,
      done: false
    };
    schedule(state.pending);
  }

  // One pair of handlers per page, shared by every execution of this file.
  if (!state.onScroll) state.onScroll = handleScroll;
  if (!state.onWheel) state.onWheel = handleWheel;

  // Re-attaching the same function is a no-op, so this is safe to call often.
  function attach() {
    try {
      window.addEventListener('scroll', state.onScroll, { passive: true, capture: true });
    } catch (error) {
      /* ignore */
    }
    try {
      window.addEventListener('wheel', state.onWheel, { passive: true, capture: true });
    } catch (error) {
      /* ignore */
    }
  }

  attach();

  // document.open() unloads the document and takes the window listeners with it.
  if (!state.watchInstalled && typeof Document === 'function') {
    state.watchInstalled = true;
    ['open', 'close'].forEach(function (name) {
      var original = Document.prototype[name];
      if (typeof original !== 'function') return;
      Document.prototype[name] = function () {
        var result = original.apply(this, arguments);
        if (this === document) setTimeout(attach, 0);
        return result;
      };
    });
  }

  if (!state.lateAttachScheduled) {
    state.lateAttachScheduled = true;
    setTimeout(attach, 0);
    setTimeout(attach, 400);
    setTimeout(attach, 1500);
    setTimeout(attach, 4000);
    window.addEventListener('pageshow', attach);
    window.addEventListener('focus', attach);
  }
})();
