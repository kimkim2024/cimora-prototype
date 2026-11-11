/* Product hero: the promise, then the workspace itself.
   The visual is a layered device mockup built from markup rather than a
   screenshot - two pastel sheets behind a browser window, and a phone resting
   over its corner. Same structure as web/src/components/ui/HeroMockup.tsx.
   Styles live in cimora-hero-mockup.css. */

function p3mIcon(path, cls) {
  return `<svg class="${cls || 'p3m-glyph'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function p3mTile(color, label, path) {
  return `<div class="p3m-tile"><span style="background:${color}">${p3mIcon(path)}</span><i>${label}</i></div>`;
}

function p3mPhone() {
  const rows = Array.from({ length: 15 }, () => '<span></span>').join('');
  return `<div class="p3m-phone"><div class="p3m-screen">
    <div class="p3m-status"><span>9:41</span><span class="p3m-batt">${p3mIcon(
      '<rect x="1" y="2" width="20" height="10" rx="3" fill="none"/><rect x="3" y="4" width="15" height="6" rx="1.6" fill="#22c55e" stroke="none"/>',
      'p3m-battery'
    )}<i>100%</i></span></div>
    <div class="p3m-user"><span></span><b>Cimora</b></div>
    <div class="p3m-grid">${rows}</div>
  </div></div>`;
}

function productHeroMockup() {
  return `<section class="p3m-hero">
    <div class="p3m-inner">
            <h1>Stop scattering your story<br><span>across different tools.</span></h1>
      <p class="p3m-desc">The comic is the source of truth for visuals and story; the video reuses the same characters, scenes and voice.</p>
      <a class="button primary p3m-cta" href="#/app">Open Demo Workspace</a>
    </div>

    <div class="p3m-stage">
      <div class="p3m-art" aria-hidden="true">
        <div class="p3m-sheet p3m-lilac"></div>
        <div class="p3m-sheet p3m-peach"></div>

        <div class="p3m-window">
          <div class="p3m-bar">
            <i class="p3m-red"></i><i class="p3m-yellow"></i><i class="p3m-green"></i>
            <span class="p3m-nav">${p3mIcon('<path d="M14 6l-6 6 6 6"/>')}${p3mIcon('<path d="M10 6l6 6-6 6"/>')}</span>
            <span class="p3m-search">${p3mIcon('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>', 'p3m-glyph p3m-small')}Search</span>
            <span class="p3m-star">${p3mIcon('<path d="M12 4l2.4 5 5.6.7-4 3.9 1 5.4L12 16.4 7 19l1-5.4-4-3.9 5.6-.7z"/>')}</span>
          </div>

          <div class="p3m-body">
            <div class="p3m-brand"><span class="p3m-logo">C</span><b>Cimora</b></div>
            <p class="p3m-label">Quick actions</p>
            <span class="p3m-marker"></span>
            <div class="p3m-actions">
              ${p3mTile('#3b82f6', 'Story', '<path d="M5 5h9a3 3 0 013 3v11H8a3 3 0 01-3-3z"/><path d="M5 16a3 3 0 013-3h9"/>')}
              ${p3mTile('#22c55e', 'Panels', '<rect x="4" y="5" width="7" height="6" rx="1.5"/><rect x="13" y="5" width="7" height="6" rx="1.5"/><rect x="4" y="13" width="16" height="6" rx="1.5"/>')}
              ${p3mTile('#a855f7', 'Motion', '<circle cx="12" cy="12" r="8"/><path d="M10.5 9l5 3-5 3z"/>')}
              ${p3mTile('#f97316', 'Assets', '<path d="M4 7a2 2 0 012-2h3l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2z"/>')}
              ${p3mTile('#ef4444', 'Delivery', '<path d="M5 12.5l4.5 4.5L19 7"/>')}
            </div>
          </div>
        </div>

        ${p3mPhone()}
      </div>
    </div>
  </section>`;
}
