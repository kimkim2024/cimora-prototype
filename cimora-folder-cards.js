/* ===========================================================================
   Glass folder cards — My Projects (#/app/projects)
   A folder drawn as an object rather than as a picture of one: a back panel
   holding the project's own cover art, the chapters as real sheets inside it,
   and a frosted front panel with the label.

   - Rest      flat and closed; the tops of the chapters only just show.
   - Hover     the front panel leans toward you and the sheets lift a little.
   - Open      the panel falls forward and the chapters fan out, each one a
               button that opens that chapter in the workbench.
   - Key (···) a frosted menu: continue, open, add a chapter, duplicate,
               move to trash.

   Vanilla port of the glass-folder-cards reference. It reads the project cards
   the studio already renders and replaces them, so cimora-pages.js stays as is.
   =========================================================================== */
(() => {
  const S = window.Site;
  if (!S) return;

  const W = 340;
  const H = 272;
  const HEADROOM = 54;
  const MAX_VISIBLE = 4;
  const MAX_W = 372;

  const BACK_PATH = 'M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z';
  const FRONT_PATH = 'M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 176A22 22 0 0 1 318 198L22 198A22 22 0 0 1 0 176Z';

  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }

  function rand(a) {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // one gradient the front-panel rims share, injected once
  function injectRim() {
    if (document.getElementById('cfRimDefs')) return;
    const host = document.createElement('div');
    host.id = 'cfRimDefs';
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    host.innerHTML = '<svg width="0" height="0"><defs><linearGradient id="cfRim" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="#fff" stop-opacity=".95"/>'
      + '<stop offset=".35" stop-color="#fff" stop-opacity=".38"/>'
      + '<stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient></defs></svg>';
    document.body.appendChild(host);
  }

  function sheetsMarkup(chapters) {
    const list = Array.isArray(chapters) ? chapters.filter(Boolean) : [];
    if (!list.length) {
      return '<div class="gf-sheet-slot" role="listitem"><button class="gf-sheet" type="button" disabled'
        + ' style="--gf-slot:0;--gf-depth:0;--gf-jx:0px;--gf-jr:0deg;z-index:1">'
        + '<span class="gf-lines" aria-hidden="true"><i style="width:86%"></i><i style="width:92%"></i><i style="width:64%"></i></span>'
        + '<span class="gf-sheet-head"><span class="gf-sheet-name">No chapters yet</span><span class="gf-sheet-meta">Empty</span></span></button></div>';
    }
    const start = Math.max(0, list.length - MAX_VISIBLE);
    const visible = list.slice(start);
    return visible.map((c, v) => {
      const seed = hash(String(c.id || c.title || v) + ':' + v);
      const jx = ((rand(seed) - 0.5) * 10).toFixed(2);
      const jr = ((rand(seed ^ 0x9e3779b9) - 0.5) * 3.2).toFixed(2);
      const slot = visible.length <= 1 ? 0 : (v / (visible.length - 1)) * 2 - 1;
      const depth = visible.length - 1 - v;
      return '<div class="gf-sheet-slot" role="listitem">'
        + '<button class="gf-sheet" type="button" data-chapter="' + esc(c.id || '') + '"'
        + ' style="--gf-slot:' + slot.toFixed(3) + ';--gf-depth:' + depth + ';--gf-jx:' + jx + 'px;--gf-jr:' + jr + 'deg;z-index:' + (v + 1) + '"'
        + ' aria-label="Open chapter ' + esc(c.title || '') + '">'
        + '<span class="gf-lines" aria-hidden="true"><i style="width:86%"></i><i style="width:92%"></i><i style="width:64%"></i><i style="width:88%"></i><i style="width:42%"></i></span>'
        + '<span class="gf-sheet-head"><span class="gf-sheet-name">' + esc(c.title || 'Untitled chapter') + '</span>'
        + (c.status ? '<span class="gf-sheet-meta">' + esc(c.status) + '</span>' : '')
        + '</span></button></div>';
    }).join('');
  }

  function menuMarkup(d) {
    const items = [
      ['continue', 'Continue creating', ''],
      ['open', 'Open project', ''],
      ['chapter', 'New chapter', ''],
      ['duplicate', 'Duplicate project', ''],
    ];
    items.push(d.archived ? ['restore', 'Restore project', ''] : ['archive', 'Move to trash', ' gf-menu-item--danger']);
    return '<div class="gf-menu" role="menu" aria-label="' + esc(d.name) + ' options">'
      + items.map(([act, label, cls]) => '<button class="gf-menu-item' + cls + '" type="button" role="menuitem" data-menu="' + act + '">' + label + '</button>').join('')
      + '</div>';
  }

  function markup(d) {
    const n = d.chapters.length;
    const meta = d.meta || (n === 1 ? '1 chapter' : n + ' chapters');
    return '<div class="gf-root" data-id="' + esc(d.id) + '" role="group" aria-label="' + esc(d.name) + ' folder">'
      + '<div class="gf-stage">'
      + '<div class="gf-tilt">'
      + '<div class="gf-shadow" aria-hidden="true"></div>'

      + '<div class="gf-back" style="clip-path:path(\'' + BACK_PATH + '\')" aria-hidden="true">'
      + (d.img ? '<img class="gf-art" src="' + esc(d.img) + '" alt="" width="' + (W + 24) + '" height="' + (H + 24) + '" draggable="false">' : '')
      + '<div class="gf-back-sheen"></div></div>'
      + '<svg class="gf-rim gf-back-rim" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><path d="' + BACK_PATH + '"/></svg>'

      + '<div class="gf-front" style="clip-path:path(\'' + FRONT_PATH + '\')">'
      + '<div class="gf-tint" aria-hidden="true"></div>'
      + '<div class="gf-spec" aria-hidden="true"></div>'
      + '<svg class="gf-rim gf-front-rim" viewBox="0 0 ' + W + ' 198" aria-hidden="true"><path d="' + FRONT_PATH + '" stroke="url(#cfRim)"/></svg>'
      + (d.badge ? '<span class="gf-kicker">' + esc(d.badge) + '</span>' : '')
      + '<button class="gf-hit" type="button" aria-expanded="false" aria-label="Open ' + esc(d.name) + ', ' + esc(meta) + '"></button>'
      + '<div class="gf-label">'
      + '<span class="gf-title">' + esc(d.name) + '</span>'
      + '<span class="gf-meta">' + esc(meta) + '</span>'
      + (d.desc ? '<span class="gf-desc">' + esc(d.desc) + '</span>' : '')
      + '</div></div>'

      + '<div class="gf-files" role="list" aria-label="' + esc(d.name) + ' chapters" inert>' + sheetsMarkup(d.chapters) + '</div>'

      + '<button class="gf-key" type="button" aria-label="' + esc(d.name) + ' options" aria-haspopup="menu" aria-expanded="false">'
      + '<svg class="gf-dots" viewBox="0 0 24 6" aria-hidden="true"><circle cx="3" cy="3" r="2.1"/><circle cx="12" cy="3" r="2.1"/><circle cx="21" cy="3" r="2.1"/></svg>'
      + '</button>'
      + menuMarkup(d)
      + '</div></div></div>';
  }

  function setOpen(root, open) {
    root.toggleAttribute('data-open', !!open);
    root.querySelector('.gf-hit')?.setAttribute('aria-expanded', open ? 'true' : 'false');
    root.querySelector('.gf-files')?.toggleAttribute('inert', !open);
    const toggle = root.querySelector('[data-menu="toggle"]');
    if (toggle) toggle.textContent = open ? 'Close folder' : 'Open folder';
  }

  function setMenu(root, open) {
    if (!root) return;
    root.querySelector('.gf-menu')?.toggleAttribute('data-open', !!open);
    root.querySelector('.gf-key')?.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  // reuse the studio's own handlers for the actions it already owns
  function fire(act, id) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.act = act;
    b.dataset.id = id;
    b.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
    document.body.appendChild(b);
    b.click();
    b.remove();
  }

  function bind(root, d) {
    if (!root || root.dataset.bound) return;
    root.dataset.bound = '1';
    const id = d.id;

    root.querySelector('.gf-hit')?.addEventListener('click', (e) => {
      e.preventDefault();
      setMenu(root, false);
      setOpen(root, !root.hasAttribute('data-open'));
    });

    root.querySelector('.gf-key')?.addEventListener('click', (e) => {
      e.preventDefault();
      const menu = root.querySelector('.gf-menu');
      setMenu(root, !menu?.hasAttribute('data-open'));
    });

    root.querySelectorAll('.gf-sheet[data-chapter]').forEach((sheet) => {
      sheet.addEventListener('click', () => {
        const chapter = sheet.dataset.chapter;
        if (chapter && id) S.route('/app/editor/' + id + '/' + chapter);
      });
    });

    root.querySelector('.gf-menu')?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-menu]');
      if (!item || !id) return;
      const act = item.dataset.menu;
      setMenu(root, false);
      if (act === 'toggle') setOpen(root, !root.hasAttribute('data-open'));
      else if (act === 'continue') S.route(d.cont || ('/app/projects/' + id));
      else if (act === 'open') S.route('/app/projects/' + id);
      else if (act === 'chapter') fire('new-chapter', id);
      else if (act === 'duplicate') fire('duplicate-project', id);
      else if (act === 'archive') fire('archive-project', id);
      else if (act === 'restore') fire('restore-project', id);
    });

    // light and parallax follow the cursor, without re-rendering
    let raf = 0;
    let px = 0;
    let py = 0;
    const write = () => {
      raf = 0;
      root.style.setProperty('--gf-px', px.toFixed(3));
      root.style.setProperty('--gf-py', py.toFixed(3));
    };
    root.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = root.getBoundingClientRect();
      if (!r.width || !r.height) return;
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    });
    root.addEventListener('pointerleave', () => {
      px = 0;
      py = 0;
      if (!raf) raf = requestAnimationFrame(write);
    });
  }

  function layout(cell) {
    const root = cell.querySelector('.gf-root');
    if (!root) return;
    const avail = Math.max(240, Math.min(cell.clientWidth || MAX_W, MAX_W));
    const k = avail / W;
    root.style.width = (W * k).toFixed(2) + 'px';
    root.style.height = ((H + HEADROOM) * k).toFixed(2) + 'px';
    const stage = root.querySelector('.gf-stage');
    if (stage) stage.style.transform = 'translateY(' + (HEADROOM * k).toFixed(2) + 'px) scale(' + k.toFixed(4) + ')';
  }

  function layoutAll() {
    document.querySelectorAll('#cm-project-list.cf-grid .cf-cell').forEach(layout);
  }

  function readCard(card) {
    const link = card.querySelector('a[href*="/app/projects/"]');
    if (!link) return null;
    const id = link.getAttribute('href').split('/').filter(Boolean).pop();
    if (!id) return null;
    const p = (S.state.projects || []).find((x) => x.id === id) || {};
    const img = card.querySelector('a > img')?.getAttribute('src') || '';
    const name = (card.querySelector('h3')?.textContent || p.name || '').trim();
    const desc = (card.querySelector('p')?.textContent || p.desc || '').trim();
    const meta = (card.querySelector('small')?.textContent || '').trim();
    const badge = (card.querySelector('.cm-image-badge')?.textContent || '').trim();
    const cont = (card.querySelector('a.cm-text-link')?.getAttribute('href') || '').replace(/^#/, '');
    return {
      id,
      img,
      name: name || 'Untitled project',
      desc,
      meta,
      badge,
      cont,
      archived: !!p.archived,
      chapters: Array.isArray(p.chapters) ? p.chapters : [],
    };
  }

  function enhance() {
    const grid = document.getElementById('cm-project-list');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.cm-project-card'));
    if (!cards.length) return;

    const cells = [];
    cards.forEach((card) => {
      const d = readCard(card);
      if (!d) return;
      const cell = document.createElement('article');
      cell.className = 'cf-cell';
      cell.dataset.id = d.id;
      cell.innerHTML = markup(d);
      const root = cell.querySelector('.gf-root');
      bind(root, d);
      cells.push(cell);
    });
    if (!cells.length) return;

    injectRim();
    grid.classList.add('cf-grid');
    grid.replaceChildren.apply(grid, cells);
    cells.forEach(layout);
    cells.forEach((cell, i) => {
      window.setTimeout(() => cell.querySelector('.gf-root')?.setAttribute('data-entered', ''), 30 + i * 70);
    });
  }

  // Escape and a press outside close whatever is open
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('#cm-project-list .gf-root').forEach((root) => {
      const menu = root.querySelector('.gf-menu');
      if (menu?.hasAttribute('data-open')) setMenu(root, false);
      else if (root.hasAttribute('data-open')) setOpen(root, false);
    });
  });

  document.addEventListener('pointerdown', (e) => {
    document.querySelectorAll('#cm-project-list .gf-root').forEach((root) => {
      const menu = root.querySelector('.gf-menu');
      if (menu?.hasAttribute('data-open') && !menu.contains(e.target) && !root.querySelector('.gf-key')?.contains(e.target)) {
        setMenu(root, false);
      }
      if (root.hasAttribute('data-open') && !root.contains(e.target)) setOpen(root, false);
    });
  });

  let resizeTick = 0;
  window.addEventListener('resize', () => {
    if (resizeTick) return;
    resizeTick = requestAnimationFrame(() => {
      resizeTick = 0;
      layoutAll();
    });
  });

  // re-run when the search box or the archive toggle re-renders the plain cards
  let tick = 0;
  new MutationObserver(() => {
    if (tick) return;
    tick = requestAnimationFrame(() => {
      tick = 0;
      enhance();
    });
  }).observe(document.body, { childList: true, subtree: true });

  // and after every route render
  (function hook() {
    const ws = S.workspace;
    if (!ws || ws.__cfHooked) return;
    const prev = ws.afterRender;
    ws.afterRender = function (ctx) {
      if (typeof prev === 'function') prev.call(ws, ctx);
      enhance();
    };
    ws.__cfHooked = true;
  })();

  window.CimoraFolders = { enhance };
})();
