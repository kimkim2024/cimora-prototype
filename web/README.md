# Cimora web (React + Tailwind)

The real UI, starting next to the prototype rather than replacing it in one go:
`../index.html` and its `site-*.js` modules keep running as the interactive
reference, while everything new is written here.

## Stack

- **Vite 8** + **React 19** + **TypeScript 5.9**
- **Tailwind CSS 4** through `@tailwindcss/vite` (no `tailwind.config.js` — the
  theme lives in `src/styles/theme.css` under `@theme`)
- Self-hosted faces: Inter variable (`@fontsource-variable/inter`) and the
  Space Grotesk / Bricolage / Instrument Serif woff2 files already in
  `../assets/fonts`, pulled in through `../design/fonts.css`

No component library yet. If a component arrives as a shadcn snippet, put it in
`src/components/ui/` and keep the `components/ui` path so future snippets drop
in unchanged.

## Scripts

| command | what it does |
| --- | --- |
| `npm run dev` | dev server on http://localhost:5173 |
| `npm run build` | theme check → type check → production build in `dist/` |
| `npm run preview` | serve the built output |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run theme:check` | fail if the palette drifts from `../design/tokens.css` |

## Design tokens

`design/tokens.css` stays the single source of truth. Tailwind v4 needs the
palette inside `@theme` to generate utilities, so the values are mirrored in
`src/styles/theme.css` and `npm run theme:check` compares the two on every
build — never edit one without the other.

Rules that still apply here: one accent per screen (lime `#c8f24e`, only for
"live / current / generating"), paper white surfaces, 1px `#dedede` hairlines,
no decorative arrows, no uppercase kickers above headings.

## Wide-screen layout

Every page is desktop-first and scales up instead of sitting in a laptop-width
column. The width rule lives in one place, `src/styles/theme.css`:

| viewport | `.container-page` | gutters | `.container-prose` |
| --- | --- | --- | --- |
| < 1440 | 1200 | 40px | 820 |
| >= 1440 (`wide`) | 1360 | 56px | 900 |
| >= 1760 (`ultra`) | 1560 | 64px | 960 |
| >= 2200 (`mega`) | 1720 | 72px | 1000 |

`container-page` is for cards and catalog grids, `container-prose` for
long-form reading (help, legal, guides). The breakpoints are also available as
Tailwind variants — `wide:`, `ultra:`, `mega:` — for type steps
(`text-[44px] wide:text-[48px]`) and stage sizes. Do not add a per-page width;
change the container instead.

## The product hero

/product opens on the awwwards-portfolio pattern: drifting dust, two columns of
running portraits, a very large headline, and a scroll-linked exit (opacity,
scale, translate and blur over the first 800px) with the next section rising
over it. ramer-motion is the only runtime dependency added for it (~50 kB
gzipped); the dust is a plain canvas.

The six portraits in public/hero-slider/ are the **placeholder art from the
template** (MIT, xkintaro/kintarowwwards) - swap the two arrays at the top of
sections/HeroSpotlight.tsx for Cimora stills before any public launch. The
hero is light-theme adapted: ink dust, portraits at low opacity, no
mix-blend-difference.

## Routing

`react-router-dom` with a **hash router** (`src/router.tsx`): every link in the
prototype and in the copy is written as `#/path`, so the new app inherits the
scheme instead of rewriting it, and a static host needs no rewrite rules.

- `/` → redirects to `/product`
- `/product` → the ported page
- anything else → `NotPorted`, which names the route and offers a link into the
  prototype (`VITE_LEGACY_URL`, default `http://127.0.0.1:4173`)

Add a page by creating `src/pages/X.tsx` and one route entry; the shell
(`SiteLayout`) supplies the header, footer, title and scroll reset.

## What is ported so far

Every public page of the site:

| route | file |
| --- | --- |
| /product | pages/ProductPage.tsx (hero: sections/HeroSpotlight.tsx + components/effects/ParticlesField.tsx, then sections/ProductionLine, ModeComparison, ClosingCta) |
| /features/:id | pages/FeaturesPage.tsx |
| /showcase, /showcase/:id | pages/CatalogPages.tsx, pages/DetailPages.tsx |
| /templates, /templates/:id | same pair |
| /resources, /resources/:id, /resources/updates | same pair |
| /pricing | pages/PricingPage.tsx |
| /help | pages/InfoPages.tsx |
| /tools | pages/InfoPages.tsx |
| /legal/:doc | pages/InfoPages.tsx |

Studio (AppLayout, sidebar shell):

| route | state |
| --- | --- |
| /app | redirects to /app/projects |
| /app/projects | pages/app/ProjectsPage.tsx — filter, search, folder cards, new-project tile |
| /app/assets, /app/tasks, /app/settings | NotPorted (links into the prototype) |

Still in the prototype, reached through NotPorted: /auth (smoke login),
/tools/:id (the 14 tool demos) and /share/*.

Shared pieces: components/SiteHeader, components/SiteFooter,
components/ui/{PageHero,Section,Cards,Faq,Chips}, and the content in
data/site.ts + data/product.ts, carried over from the prototype.
