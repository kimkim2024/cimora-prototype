# CIMORA — Machine-Readable Design Spec (v1.0)

**Audience:** an AI agent or designer building or restyling pages in this repository.
**Read this file completely before writing any CSS or markup.**
Companion documents: `design/DESIGN-SYSTEM.md` (human rationale, Chinese), `#/styleguide` (live reference), `design/tokens.css` (the only source of values).

---

## 0. Non-negotiable constraints

| # | Rule | Failure mode if ignored |
|---|---|---|
| 1 | **No build step.** Plain HTML + CSS + vanilla JS. No React, Vue, Next, Svelte, Tailwind, shadcn, no bundler, no `npm` dependency at runtime. | The prototype must open from `file://` with zero tooling. |
| 2 | **Desktop only.** Do not write mobile layouts, touch branches or `max-width` under 1280. Allowed breakpoints: `max-width:1440`, `max-width:1280`, `min-width:1920`. | Reviewed at 1440 and 1920 only. |
| 3 | **Interface copy is English.** No CJK anywhere in rendered output. (Legacy Chinese source strings are tolerated; new ones are not.) | Enforced by `npm run shots`. |
| 4 | **No decorative arrow glyphs** (`→ ↗ ← ↑ ↓ ➡ ↶ ↻`). They are stripped at render time. Use a line icon or plain text. | `npm run shots` reports arrows. |
| 5 | **One accent per screen.** Lime (`--color-accent`) marks the current/actionable thing and appears at most once per viewport. | The whole identity is "paper + ink + one fluorescent mark". |
| 6 | **Every value comes from `design/tokens.css`.** Literal hex colours, off-scale font sizes, off-grid spacing and off-scale radii are lint errors. | `npm run lint` fails. |
| 7 | **Never edit shared base files** (`site.css`, `site-refinements.css`, `cimora.css`, `site-core.js`, `cimora-pages.js`, `site-workspace.js`) unless explicitly asked. Add a new module instead. | A base change leaks into 25 routes. |
| 8 | **Every selector is namespaced** by the page container (`#cm-project-list`, `body.cimora-app`, `.sg-*`, `.vx-*`). Never style a bare element/class globally. | `npm run lint` warns `unscoped-selector`. |
| 9 | **No third-party requests.** Fonts, icons and scripts are local. | Offline use and zip delivery. |
| 10 | **Reduced motion is mandatory** for every animation. | `@media (prefers-reduced-motion: reduce)` must neutralise it. |

---

## 1. Where things live

```
index.html                  every stylesheet and script is linked here, in order
design/tokens.css           ALL values (colours, type, space, radius, shadow, motion, layout, z)
design/fonts.css            @font-face for the self-hosted faces (assets/fonts/*.woff2)
design/DESIGN-SYSTEM.md     human rationale + decision log (Chinese)
design/AI-SPEC.md           this file
cimora-styleguide.css/.js   #/styleguide — the live reference; the set of approved components
tools/ui-lint.js            npm run lint   — token/scale/namespace/assets referee
tools/shots.js              npm run shots  — screenshots + rendered-text checks, no dependencies
tools/preview.js            npm run preview — static server on 127.0.0.1:4173
shots/                      generated screenshots + report.json
assets/                     images, video, fonts
```

### Adding a page or restyling an existing one

1. Create **one CSS file and optionally one JS file** for the area, prefixed `cimora-`:
   `cimora-<area>.css`, `cimora-<area>.js`.
2. Add **one line each** to `index.html`. CSS goes after `cimora-studio-skin.css`; JS goes after `cimora-workspace-dash.js`.
3. Scope every rule:
   ```css
   /* good: only this container */
   #cm-project-list.cf-grid .cf-card { ... }
   body.cimora-app .cm-panel { ... }
   /* bad: leaks everywhere */
   .cf-card { ... }
   ```
4. Never restyle by editing the renderer. If the markup lacks a hook, add a `data-` attribute or a class in the renderer, not a structural rewrite.
5. Add the file to `CONFIG.tokenised` in `tools/ui-lint.js` so it joins the system and is checked.
6. Run `npm run lint && npm run shots`. Both must pass.

---

## 2. Tokens — the complete set

Copy values with `var(--name)`. Never hardcode.

### Colour

| Token | Value | Use |
|---|---|---|
| `--color-canvas` | `#ffffff` | page ground |
| `--color-paper` | `#ffffff` | card / panel / input surface |
| `--color-paper-muted` | `#f5f5f5` | secondary block, input ground, table head |
| `--color-paper-sunken` | `#f0f0f0` | wells, thumbnails, progress track |
| `--color-paper-dark` | `#1a1714` | dark editorial section (**whole section only**) |
| `--color-paper-darkest` | `#0e0d0c` | dark section depth |
| `--color-ink` | `#171717` | primary text, primary button fill |
| `--color-ink-label` | `#404040` | form labels inside the studio |
| `--color-ink-muted` | `#666666` | captions, meta, secondary text |
| `--color-ink-quiet` | `#9a9a9a` | placeholder, disabled, timestamps |
| `--color-ink-inverse` | `#ffffff` | text on ink / dark |
| `--color-ink-on-accent` | `#171717` | text on lime |
| `--color-ink-hover` | `#2b2b2b` | primary button hover |
| `--color-hairline` | `#dedede` | 1px borders and separators |
| `--color-hairline-strong` | `#a3a3a3` | input hover, emphasised rule |
| `--color-hairline-hover` | `#c8c8c8` | button border hover |
| `--color-hairline-inverse` | `rgba(255,255,255,.14)` | rules on dark |
| `--color-accent` | `#c8f24e` | the one accent: current state, progress, Creator tag |
| `--color-accent-deep` | `#9ccc0f` | lime used as text |
| `--color-accent-soft` | `rgba(200,242,78,.16)` | selection, progress track |
| `--color-accent-text` | `#4c6b00` | readable lime-family text on white |
| `--color-accent-line` | `rgba(156,204,15,.35)` | accent tag border |
| `--color-positive` | `#256b51` | done, saved (+ `-soft`, `-line`) |
| `--color-warning` | `#b45309` | needs review (+ `-soft`, `-line`) |
| `--color-negative` | `#c02617` | failed, destructive (+ `-soft`, `-line`) |
| `--color-section-warm` | `#3fae6b` | green **only** inside the dark room band |
| `--color-section-poster` | `#0038ff` | poster band ground |
| `--color-section-poster-ink` | `#001a99` | poster hard shadow |
| `--color-section-poster-lime` | `#ccff00` | poster type |
| `--color-overlay` | `rgba(23,23,23,.82)` | pill over imagery |
| `--color-focus` | `0 0 0 2px #fff, 0 0 0 4px #171717` | focus ring (box-shadow) |
| `--color-focus-inverse` | inverse of the above | focus ring on dark |
| `--color-status-good` / `-warn` / `-bad` / `-idle` | `#2f9e63` / `#c9820a` / `#dc5343` / `#dedede` | progress bars, meters, gauge ticks - lighter than the text colours |
| `--color-placeholder-a/b` | `#e9e6df` / `#cfd6d3` | empty artwork placeholders |

**Section colours are ground colours only.** Never put `--color-section-*` on text, icons, buttons or tags.

### Type

| Token | Value | Use |
|---|---|---|
| `--font-ui` | Inter, system-ui… | every interface surface |
| `--font-display` | Space Grotesk (self-hosted) | page titles, hero headlines |
| `--font-poster` | Luckiest Guy | CTA, footer wordmark, poster band — once per screen |
| `--font-mono` | ui-monospace… | meta, numbers, token names |
| `--text-display` | `48px` | hero / poster |
| `--text-h1` | `36px` | page title |
| `--text-h2` | `30px` | section title |
| `--text-h3` | `22px` | sub-section, large card title |
| `--text-lead` | `17px` | lead paragraph, card title |
| `--text-body` | `14px` | body baseline |
| `--text-small` | `12px` | captions, secondary |
| `--text-micro` | `10px` | meta, badges, table helpers |
| `--text-eyebrow` | `10px` | with `--tracking-wide` + uppercase |
| `--leading-none/tight/snug/base/relaxed` | `1 / 1.2 / 1.4 / 1.6 / 1.8` | — |
| `--weight-regular/medium/bold/poster` | `400 / 500 / 700 / 900` | 900 only for the poster band |
| `--tracking-display/heading/base/wide/wider` | `-.02em / -.01em / 0 / .18em / .22em` | — |

Sizes outside this table are a defect. Legacy 13px / 9px / 11px map to 14 / 10 / 12.

### Space, radius, shadow, motion, layout

| Token | Values |
|---|---|
| `--space-1…24` | `4 8 12 16 24 32 48 64 96` — 4px grid, nothing between |
| `--radius-xs/sm/md/lg/xl/2xl/pill/circle` | `4 6 8 12 16 30 999 50%` |
| `--shadow-sm/md/lg/key` | 1px lift / card / float / black key |
| `--glass-blur` / `--glass-fill` | `16px` / `rgba(255,255,255,.72)` — glass is allowed only on the poster band, the glass folder card and floating menus |
| `--dur-fast/base/slow/hero` | `140 / 200 / 400 / 700 ms` |
| `--ease-standard/spring/linear` | `cubic-bezier(.22,1,.36,1)` / `cubic-bezier(.34,1.36,.5,1)` / `linear` |
| `--container` / `--container-gutter` | `1200px` / `48px` (public pages) |
| `--studio-max` / `--studio-gutter` | `1600px` / `28px` (studio pages) |
| `--z-base/sticky/dropdown/overlay/toast` | `0 / 10 / 20 / 100 / 150` |
| `--icon-sm/md/lg`, `--icon-stroke` | `16 / 20 / 24px`, `1.5` |

---

## 3. Approved components

`#/styleguide` renders each of these. **The set is closed:** if a page needs something new, add it to the styleguide first, then use it. Nothing below assumes a framework.

| Component | Spec |
|---|---|
| **Button** | height 42 (`small` 34), padding 10/18 (small 7/12), radius `--radius-md`, 1px `--color-hairline`, label `--text-body`/500. Variants: default (white), `primary` (ink fill, inverse label), `ghost` (transparent, muted label), `danger`, `text` (underline), `accent` (lime, max 1 per screen). States: hover (`--color-paper-muted` / `--color-ink-hover`), active (`translateY(1px)`), focus (`--color-focus`), disabled (opacity .42), loading (12px spinner + label). |
| **Input** | height 40, padding 0/12, radius `--radius-sm`, border `--color-hairline`, focus = ink border + `--color-focus-soft` ring, invalid = `--color-negative` border + micro error line, disabled = `--color-paper-muted`. Textarea min-height 84. |
| **Checkbox / radio / switch** | 16px box, radius 4 (circle for radio), checked = ink fill with inverse mark; switch 36×20 pill with 14px knob. |
| **Segmented** | container `--color-paper-muted`, 1px hairline, radius `--radius-md`, inner radius `--radius-sm`; active segment = white + `--shadow-sm`. |
| **Filter chip** | padding 6/10, radius `--radius-xs`, 1px hairline; active = ink fill, inverse label. |
| **Tag** | micro 10px, padding 4/8, radius `--radius-xs`, 5px dot, variants default / accent / positive / warning / negative. |
| **Card** | 16:9 artwork, radius `--radius-lg`, 1px hairline, one pill over the image (`--color-overlay`), body padding 16, title `--text-lead`/500, meta `--text-small` muted. |
| **Table** | header micro uppercase `--tracking-wide` muted, row 10px vertical padding, hairline row rules, no zebra. |
| **Empty state** | 1px dashed hairline, radius `--radius-lg`, centred, strong `--text-lead` + one muted line + one primary small button. |
| **Notice** | 1px hairline + 3px left rule (ink / warning / negative), `--color-paper-muted` or the matching `-soft` wash. |
| **Toast** | ink fill, inverse text, radius `--radius-md`, 10/14 padding, bottom centre, `--z-toast`. |
| **Dialog** | radius `--radius-xl`, `--shadow-lg`, header hairline, body 24 padding, footer right-aligned, `--z-overlay`. |
| **Breadcrumb / section head / eyebrow** | breadcrumb `--text-small` with `--color-ink-quiet` separators; section head = h3 + muted count, hairline underline; eyebrow = micro, `--tracking-wider`, uppercase, muted. |

Page composition rules: one `h1` per page (`--text-h1`, `--font-display`), sections separated by `--space-16`, grids `repeat(auto-fill, minmax(300px, 1fr))` with `--space-6` gaps, every list defines its empty state, every async action defines loading and error.

---

## 4. Forbidden

- React / Vue / Svelte / Next / Tailwind / shadcn / any bundler or `import` of a package.
- Google Fonts, Material Icons, CDN scripts — fonts and icons are local.
- Literal colours, off-scale type/spacing/radius.
- Bare selectors; `!important` beyond the documented budget.
- A second accent, gradient buttons, glow, neon outlines.
- Decorative arrows or glyph icons used as UI icons (line SVG only: 24 viewBox, stroke 1.5, `currentColor`, 16/20/24 rendered).
- Mobile breakpoints, hover-only affordances, hidden keyboard focus.
- Invented data, fake contacts, fake metrics, placeholder lorem in shipped pages.

---

## 5. Verification (must pass before handing back)

```bash
npm run lint     # 0 errors expected; warnings must not grow
npm run shots    # 12 routes x 1440/1920; 0 cjk, 0 arrows, 0 empty pages
```

`npm run shots` writes `shots/<route>-<w>.png` and `shots/report.json`. A route is done when: it renders (not empty), contains no CJK, contains no arrow glyph, and the screenshot at 1440 shows no overflow or clipped text. Compare before/after screenshots for every page you touch.

`npm run lint` reads `tools/ui-lint-baseline.json` — known-heavy legacy assets stay warnings; anything new or grown is an error.

---

## 6. Status of the codebase (so you do not "fix" the wrong thing)

| Area | State |
|---|---|
| `design/tokens.css`, `design/fonts.css`, `#/styleguide` | v1.0, fully tokenised, lint-clean |
| My Projects (`#/app/projects`) with the glass folder cards | done, uses tokens |
| Creation Space dashboard (`#/app`) | done, uses its own module values (not yet tokenised) |
| Asset Library, Tasks, Showcase/Market, New project, Billing, Settings, workbench | **not restyled** — these are the pages a designer is expected to take on |
| Legacy CSS (`site.css`, `cimora.css`, `cimora-home.css`, …) | dark base + light overrides; contains literal values and Chinese source strings that are tolerated for now. Do not refactor them wholesale; build new modules instead. |
| Public header (`publicHeader` → `homeHeader`) | one shared `h17-header` bar on every public route; it reads the `--ap-*` set, which `cimora-public-light.css` now maps to tokens. Its background fades to transparent at the bottom so it blends into the page instead of ending on a rule. Do not add a second header markup. |
| Breathing background | one WebGL shader (`cimora-shader-background.js`). The homepage mounts it in `.hm-hero-vignette`; every other public route mounts it in the fixed `.public-ambient` layer styled by `cimora-public-ambient.css`. Palette comes from `--shader-accent/-surface/-ink`; keep the CSS gradient fallback if you touch it. |
| Auth (`#/auth`) | `cimora-auth.js` / `cimora-auth.css`: stacked-paper panel with its own WebGL smoke shader on the left, sign-in / create-account form on the right. It is a full-page route with no site header, so it carries its own light/dark palette (`--pa-*`) and re-points `--ap-*` at it. Submit hands back to `completeAuth()`. |
| Public footer (`footer`) | still the legacy grid with literal values; restyle only when asked. |

---

## 7. Paste this to your AI before it starts

```
You are building pages for Cimora, a static HTML/CSS/vanilla-JS prototype.

Read, in this order:
  1. design/AI-SPEC.md          (rules, tokens, components, acceptance)
  2. design/tokens.css          (the only allowed values)
  3. cimora-styleguide.css      (reference implementation of every component)

Non-negotiables: no framework or build step; desktop only (breakpoints 1440/1280/1920);
English UI copy; no arrow glyphs; one accent per screen; every value via var(--token);
every selector namespaced to a page container; never edit site.css / cimora.css /
site-core.js / cimora-pages.js / site-workspace.js.

Workflow: create one cimora-<area>.css (+ optional .js), link it with one line in
index.html, add the file to CONFIG.tokenised in tools/ui-lint.js, then run
`npm run lint` and `npm run shots` and iterate until both pass with 0 errors and
the screenshots show no overflow. Do not restyle anything outside the requested area.
```

---

*Token names and values are authoritative in `design/tokens.css`; if this document and that file ever disagree, the file wins.*
