/* ===========================================================================
   Styleguide — #/styleguide
   The authoritative, executable version of the Cimora design system.
   Reads design/tokens.css. Any component added here is the reference the page
   owners copy; anything not shown here is not part of the system yet.
   =========================================================================== */
(() => {
  const S = window.Site;
  if (!S) return;

  const sw = (name, hex, note) => '<div class="sg-sw"><i style="background:var(' + name + ')"></i><div><b>' + name + '</b><code>' + hex + '</code>' + (note ? '<em>' + note + '</em>' : '') + '</div></div>';
  const sws = (items) => '<div class="sg-sws">' + items.map((a) => sw(a[0], a[1], a[2])).join('') + '</div>';

  const typeRow = (cls, name, spec, sample) => '<div class="sg-type"><div class="sg-spec"><b>' + name + '</b>' + spec + '</div><div class="sg-sample ' + cls + '">' + sample + '</div></div>';

  const space = [[4, '--space-1'], [8, '--space-2'], [12, '--space-3'], [16, '--space-4'], [24, '--space-6'], [32, '--space-8'], [48, '--space-12'], [64, '--space-16'], [96, '--space-24']];
  const radii = [[4, '--radius-xs', 'chip / tag'], [6, '--radius-sm', 'input / small button'], [8, '--radius-md', 'button / card'], [12, '--radius-lg', 'panel'], [16, '--radius-xl', 'sheet / dialog'], [30, '--radius-2xl', 'glass block'], [999, '--radius-pill', 'marketing only'], [50, '--radius-circle', 'avatar / dot']];

  const colors = () => [
    '<h3 class="sg-h3">Paper</h3>',
    sws([['--color-canvas', '#ffffff', 'page ground'], ['--color-paper', '#ffffff', 'card / panel'], ['--color-paper-muted', '#f5f5f5', 'input, table head'], ['--color-paper-sunken', '#f0f0f0', 'well, thumbnail'], ['--color-paper-dark', '#1a1714', 'dark section (whole section only)'], ['--color-paper-darkest', '#0e0d0c', 'dark section depth']]),
    '<h3 class="sg-h3">Ink</h3>',
    sws([['--color-ink', '#171717', 'text + primary button'], ['--color-ink-label', '#404040', 'studio form labels'], ['--color-ink-muted', '#666666', 'meta, captions'], ['--color-ink-quiet', '#9a9a9a', 'placeholder, disabled'], ['--color-ink-inverse', '#ffffff', 'on dark'], ['--color-ink-on-accent', '#171717', 'on lime']]),
    '<h3 class="sg-h3">Hairlines</h3>',
    sws([['--color-hairline', '#dedede', '1px separator / border'], ['--color-hairline-strong', '#a3a3a3', 'input hover']]),
    '<h3 class="sg-h3">Brand — one accent, one per screen</h3>',
    sws([['--color-accent', '#c8f24e', 'active state, progress, Creator tag'], ['--color-accent-deep', '#9ccc0f', 'lime as text (contrast safe)'], ['--color-accent-soft', 'rgba(200,242,78,.16)', 'selection, progress track']]),
    '<h3 class="sg-h3">Section colours — whole blocks only, never on a button or tag</h3>',
    sws([['--color-section-warm', '#3fae6b', 'on the dark room-demo band'], ['--color-section-poster', '#0038ff', 'poster band ground'], ['--color-section-poster-ink', '#001a99', 'poster shadow'], ['--color-section-poster-lime', '#ccff00', 'poster type']]),
    '<h3 class="sg-h3">Status</h3>',
    sws([['--color-positive', '#256b51', 'done, saved'], ['--color-warning', '#b45309', 'needs review'], ['--color-negative', '#c02617', 'failed, destructive']]),
  ].join('');

  const typography = () => [
    typeRow('sg-t-display', 'Display 48', '--text-display / 1.0 / -.02em / 700', 'Every story has its own light.'),
    typeRow('sg-t-h1', 'Heading 1 · 36', '--text-h1 / 1.2 / -.01em / 700', 'My Projects'),
    typeRow('sg-t-h2', 'Heading 2 · 30', '--text-h2 / 1.2 / 700', 'Great creation needs a project.'),
    typeRow('sg-t-h3', 'Heading 3 · 22', '--text-h3 / 1.2 / 500', 'Reunion in the Rain'),
    typeRow('sg-t-lead', 'Lead · 17', '--text-lead / 1.4 / 400', 'Seven years later, Lin Xia returns to the old bookshop.'),
    typeRow('sg-t-body', 'Body · 14', '--text-body / 1.6 / 400', 'The default text size for every studio page.'),
    typeRow('sg-t-small', 'Small · 12', '--text-small / 1.4 / 400', 'Chapter 02 · 5 assets · updated just now'),
    typeRow('sg-t-micro', 'Micro · 10', '--text-micro / 1.4 / 400', 'LOCAL DRAFT · NOT SYNCED'),
    typeRow('sg-t-eyebrow', 'Eyebrow · 10', '--text-eyebrow / .22em / uppercase', 'YOUR ORIGINAL WORLDS'),
    typeRow('sg-t-poster', 'Poster', '--font-poster / 48 (CTA, footer wordmark, poster band only)', 'CIMORA'),
    '<h3 class="sg-h3">Stacks</h3>',
    '<table class="sg-table"><tbody>',
    '<tr><td><code>--font-ui</code></td><td>Inter — every interface surface</td></tr>',
    '<tr><td><code>--font-display</code></td><td>Inter with negative tracking until a licensed display face is chosen (D5)</td></tr>',
    '<tr><td><code>--font-poster</code></td><td>Luckiest Guy — CTA, footer wordmark, poster band. Once per screen (D7)</td></tr>',
    '<tr><td><code>--font-mono</code></td><td>Meta, numbers, token names</td></tr>',
    '</tbody></table>',
    '<h3 class="sg-h3">Display face \u2014 pick one (D5)</h3>',
    '<div class="sg-faces">',
    '<div class="sg-face-a"><b>Space Grotesk \u00b7 current pick</b><span class="sample">Every story has its own light.</span><span class="chars">Ag Rg 0123 \u2014 geometric, keeps the grotesk feel</span></div>',
    '<div class="sg-face-b"><b>Instrument Serif</b><span class="sample">Every story has its own light.</span><span class="chars">Ag Rg 0123 \u2014 editorial, warmer, more literary</span></div>',
    '<div class="sg-face-c"><b>Bricolage Grotesque</b><span class="sample">Every story has its own light.</span><span class="chars">Ag Rg 0123 \u2014 optical size, poster energy</span></div>',
    '</div>',
    '<p class="sg-help">Weights: 400 / 500 / 700 only. <code>900</code> is reserved for the poster band. Weights 550 and 800 have been removed.</p>',
  ].join('');

  const spacing = () => space.map((s) => '<div class="sg-sp"><span>' + s[1] + '</span><i style="width:' + s[0] + 'px"></i><code>' + s[0] + 'px</code></div>').join('');

  const radius = () => '<div class="sg-grid4 sg-rad">' + radii.map((r) => '<div style="border-radius:' + (r[0] === 999 ? '999px' : r[0] + 'px') + '"><span>' + r[1] + '</span></div>').join('') + '</div>'
    + '<p class="sg-help">999 is allowed on the marketing header CTA and the AI composer only. Studio surfaces stop at 16 (D9).</p>';

  const shadows = () => '<div class="sg-grid4 sg-sh">'
    + [['--shadow-sm', '1px lift'], ['--shadow-md', 'card'], ['--shadow-lg', 'float / dialog'], ['--shadow-key', 'black key']]
      .map((s) => '<div style="box-shadow:var(' + s[0] + ')"><span>' + s[0] + '</span></div>').join('')
    + '</div>';

  const motion = () => '<div class="sg-mo">'
    + [['fast', '--dur-fast 140ms'], ['base', '--dur-base 200ms'], ['slow', '--dur-slow 400ms'], ['spring', '--ease-spring'], ['hero', '--dur-hero 700ms']]
      .map((m) => '<button class="' + m[0] + '">' + m[1] + '</button>').join('')
    + '</div><p class="sg-help">Hover to feel the duration. Easing: <code>--ease-standard</code> for layout, <code>--ease-spring</code> for objects, <code>--ease-linear</code> for loops. Every animation must have a <code>prefers-reduced-motion</code> off-switch.</p>';

  const buttons = () => '<div class="sg-stack">'
    + '<button class="sg-btn primary">Create project</button>'
    + '<button class="sg-btn">Secondary</button>'
    + '<button class="sg-btn ghost">Ghost</button>'
    + '<button class="sg-btn accent">Accent — max 1 per screen</button>'
    + '<button class="sg-btn danger">Delete</button>'
    + '<button class="sg-btn text">Text link</button>'
    + '<button class="sg-btn small">Small</button>'
    + '<button class="sg-btn" disabled>Disabled</button>'
    + '<button class="sg-btn primary"><span class="sp"></span>Generating</button>'
    + '</div><p>States: rest / hover / active / <strong>focus</strong> (tab through this page) / disabled / loading.</p>';

  const inputs = () => '<div class="sg-col">'
    + '<label class="sg-field"><span>Text input</span><input class="sg-input" placeholder="Name your chapter"></label>'
    + '<label class="sg-field"><span>With help</span><input class="sg-input" value="Reunion in the Rain"><small class="sg-help">Saved on this device.</small></label>'
    + '<label class="sg-field"><span>Error</span><input class="sg-input" aria-invalid="true" value=""><small class="sg-help err">A name is required.</small></label>'
    + '<label class="sg-field"><span>Disabled</span><input class="sg-input" disabled value="Locked"></label>'
    + '<label class="sg-field"><span>Select</span><select class="sg-input"><option>Comic + video</option><option>Long image</option></select></label>'
    + '<label class="sg-field"><span>Textarea</span><textarea class="sg-input" placeholder="One line is enough to begin."></textarea></label>'
    + '</div>';

  const choices = () => '<div class="sg-stack">'
    + '<label class="sg-choice"><input type="checkbox" checked> Checked</label>'
    + '<label class="sg-choice"><input type="checkbox"> Unchecked</label>'
    + '<label class="sg-choice"><input type="radio" name="sg-r" checked> Radio A</label>'
    + '<label class="sg-choice"><input type="radio" name="sg-r"> Radio B</label>'
    + '<label class="sg-choice"><input class="sg-switch" type="checkbox" checked></label>'
    + '</div>';

  const chips = () => '<div class="sg-stack">'
    + '<div class="sg-seg"><button aria-pressed="true">Grid</button><button aria-pressed="false">List</button><button aria-pressed="false">Timeline</button></div>'
    + '</div><div class="sg-stack" style="margin-top:12px">'
    + '<button class="sg-chip" aria-pressed="true">All</button><button class="sg-chip" aria-pressed="false">Comic</button><button class="sg-chip" aria-pressed="false">Story</button><button class="sg-chip" aria-pressed="false">Video</button>'
    + '</div>';

  const tags = () => '<div class="sg-stack">'
    + '<span class="sg-tag">Draft</span>'
    + '<span class="sg-tag accent">Creator</span>'
    + '<span class="sg-tag positive">Done</span>'
    + '<span class="sg-tag warning">Needs review</span>'
    + '<span class="sg-tag negative">Failed</span>'
    + '<span class="sg-tag plain">v2</span>'
    + '</div>';

  const card = () => '<div class="sg-card"><div class="art"><span class="pill">Comic + Video</span></div>'
    + '<div class="body"><h4>Before the Rain Ends</h4><p>2 chapters · 5 assets</p></div></div>';

  const table = () => '<table class="sg-table"><thead><tr><th>Chapter</th><th>Status</th><th>Length</th></tr></thead><tbody>'
    + '<tr><td>The Seventh Day After</td><td><span class="sg-tag positive">Done</span></td><td>48s</td></tr>'
    + '<tr><td>The Unsent Letter</td><td><span class="sg-tag warning">Review</span></td><td>36s</td></tr>'
    + '<tr><td>A Door Left Open</td><td><span class="sg-tag">Draft</span></td><td>—</td></tr>'
    + '</tbody></table>';

  const bits = () => '<div class="sg-col">'
    + '<div class="sg-avatars"><span class="sg-avatar">S</span><span class="sg-avatar">L</span><span class="sg-avatar">+3</span></div>'
    + '<div class="sg-bar"><i></i></div>'
    + '<div class="sg-skel" style="width:80%"></div><div class="sg-skel" style="width:56%"></div>'
    + '</div>';

  const empty = () => '<div class="sg-empty"><strong>No chapters yet</strong><p>Start with one scene; the rest can follow.</p><button class="sg-btn primary small">New chapter</button></div>';

  const notices = () => '<div class="sg-col">'
    + '<div class="sg-notice">Saved locally. Nothing is uploaded.</div>'
    + '<div class="sg-notice warn">Budget is nearly used up.</div>'
    + '<div class="sg-notice err">Provider timed out. The stable version is kept.</div>'
    + '<div class="sg-stack"><span class="sg-toast">Balance refreshed from this browser.</span>'
    + '<span class="sg-tip"><button class="sg-btn small">Hover for tooltip</button><span>Reference only</span></span></div>'
    + '</div>';

  const dialog = () => '<div class="sg-dialog"><header><strong>Start next chapter</strong><button class="sg-btn text">Close</button></header>'
    + '<div class="body"><label class="sg-field"><span>Chapter title</span><input class="sg-input" placeholder="What happens in the next panel?"></label></div>'
    + '<footer><button class="sg-btn ghost small">Cancel</button><button class="sg-btn primary small">Create chapter</button></footer></div>';

  const heads = () => '<div class="sg-col">'
    + '<div class="sg-breadcrumb">Creation Space <i>/</i> <b>My Projects</b></div>'
    + '<div class="sg-sectionhead"><h4>Get to know your worlds</h4><span>4 projects</span></div>'
    + '<span class="sg-eyebrow">Your original worlds</span>'
    + '</div>';

  const comp = (title, body, wide) => '<div class="sg-comp' + (wide ? ' sg-wide' : '') + '"><h3>' + title + '</h3>' + body + '</div>';

  const components = () => '<div class="sg-comps">'
    + comp('Buttons', buttons(), true)
    + comp('Inputs', inputs())
    + comp('Checkbox · Radio · Switch', choices())
    + comp('Segmented · Filter chips', chips())
    + comp('Tags', tags())
    + comp('Card — 16:9 artwork', card())
    + comp('Table', table())
    + comp('Avatar · Progress · Skeleton', bits())
    + comp('Empty state', empty())
    + comp('Notice · Toast · Tooltip', notices())
    + comp('Dialog', dialog(), true)
    + comp('Breadcrumb · Section head · Eyebrow', heads())
    + '</div>';

  const rules = () => '<div class="sg-rules">'
    + '<div class="sg-rule good"><h4>Do</h4><ul>'
    + '<li>One accent per screen; the rest is ink on paper.</li>'
    + '<li>Every value comes from <code>tokens.css</code>.</li>'
    + '<li>Scope every new rule to a page container.</li>'
    + '<li>English copy, sentence case, no exclamation.</li>'
    + '<li>Line icons: 24 viewBox, stroke 1.5, text-relative colour.</li>'
    + '<li>Whole-section dark bands, one green only.</li>'
    + '</ul></div>'
    + '<div class="sg-rule bad"><h4>Don\'t</h4><ul>'
    + '<li>No decorative arrows (pasted glyph icons are stripped at render).</li>'
    + '<li>No Chinese characters anywhere in the interface.</li>'
    + '<li>No second brand colour, no gradient buttons.</li>'
    + '<li>No pills inside the studio.</li>'
    + '<li>No bare class selectors (they leak to other routes).</li>'
    + '<li>No React, Tailwind, shadcn or build step.</li>'
    + '</ul></div>'
    + '</div>';

  const migrate = () => '<table class="sg-table sg-migrate"><thead><tr><th>Today</th><th>Tokenised</th><th>Visible change</th></tr></thead><tbody>'
    + '<tr><td>13px button / label</td><td>--text-body 14px</td><td>+1px on buttons</td></tr>'
    + '<tr><td>9px / 11px meta</td><td>--text-micro 10 / --text-small 12</td><td>dense tables breathe slightly</td></tr>'
    + '<tr><td>radius 9px (button)</td><td>--radius-md 8px</td><td>corners -1px</td></tr>'
    + '<tr><td>999px pills ×18</td><td>header CTA + AI composer only</td><td>studio pills become 4/8</td></tr>'
    + '<tr><td>8 different shadows</td><td>4 levels</td><td>softer, consistent lift</td></tr>'
    + '<tr><td>#6b7280 (21 uses, header)</td><td>--color-ink-muted #666666</td><td>header meta slightly darker</td></tr>'
    + '<tr><td>#facc15 yellow</td><td>--color-warning #b45309</td><td>readable on white</td></tr>'
    + '<tr><td>13 breakpoints</td><td>2 (1440 / 1280)</td><td>needs one regression pass</td></tr>'
    + '<tr><td>font-weight 550 / 800</td><td>500 / 700</td><td>none (they already fell back)</td></tr>'
    + '</tbody></table>';

  const nav = [['sg-color', 'Colour'], ['sg-type', 'Type'], ['sg-space', 'Spacing'], ['sg-radius', 'Radius'], ['sg-shadow', 'Elevation'], ['sg-motion', 'Motion'], ['sg-components', 'Components'], ['sg-rules', 'Rules'], ['sg-migrate', 'Migration']];

  const sec = (id, title, lead, body) => '<section class="sg-sec" id="' + id + '"><header><h2>' + title + '</h2><p>' + lead + '</p></header>' + body + '</section>';

  function page() {
    S.pageTitle = 'Cimora Design System';
    return '<main class="sg">'
      + '<div class="sg-wrap">'
      + '<header class="sg-hero">'
      + '<span class="sg-eyebrow">Design system · v1.0</span>'
      + '<h1>Cimora Design System</h1>'
      + '<p>One accent, ink on paper, objects over decoration. Every value on this page lives in <code>design/tokens.css</code>; every component here is the reference for the pages you own.</p>'
      + '<div class="sg-meta"><span>tokens v1.0</span><span>desktop only</span><span>english only</span><span>no build step</span><span>source: homepage 347 elements + studio</span></div>'
      + '</header>'
      + '<nav class="sg-nav"><ol>' + nav.map((n) => '<li><a href="#' + n[0] + '">' + n[1] + '</a></li>').join('') + '</ol></nav>'
      + sec('sg-color', 'Colour', 'Paper, ink, one hairline, one accent. Section colours are allowed as whole blocks only.', colors())
      + sec('sg-type', 'Typography', 'Eight sizes, three weights. Inter everywhere; the poster face is a once-per-screen exception.', typography())
      + sec('sg-space', 'Spacing', '4px grid. If a number is not here, it is wrong.', spacing())
      + sec('sg-radius', 'Radius', 'Small objects are tight; only marketing surfaces get round.', radius())
      + sec('sg-shadow', 'Elevation', 'Four levels. Elevation means "it floats above", not "it looks nice".', shadows())
      + sec('sg-motion', 'Motion', 'Nothing moves without a reason, a duration and a reduced-motion off-switch.', motion())
      + sec('sg-components', 'Components', 'The set is closed: a page that needs something new raises it here first.', components())
      + sec('sg-rules', 'Rules', 'Six things to do, six to avoid. Both lists are enforced by tools/ui-lint.js.', rules())
      + sec('sg-migrate', 'Migration', 'What changes when a page adopts the tokens. Nothing here is applied yet.', migrate())
      + '</div></main>';
  }

  const prev = S.public.render;
  S.public.render = function (ctx) {
    if (ctx && ctx.parts && ctx.parts[0] === 'styleguide') return page(ctx);
    return prev.call(S.public, ctx);
  };
})();
