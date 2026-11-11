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

## What is ported so far

`/product` is complete:

- `src/components/SiteHeader.tsx` — the shared public bar (flat links, one CTA)
- `src/components/SiteFooter.tsx` — the shared footer (brand, three link columns, legal row)
- `src/sections/ProductWorld.tsx` — the four stills, one story at each stage
- `src/sections/ProductionLine/` — "From creating to continuous production":
  a live production line (story → comic panels → motion shot → studio workflow →
  delivered), the three stage columns, and the chapter budget strip with a
  scrubbable spend curve. Hover either the diagram or a column to pin the
  highlight; the auto-cycle pauses while a pointer is inside and is disabled
  under `prefers-reduced-motion`.
- `src/sections/ModeComparison.tsx` — quick mode vs studio mode
- `src/sections/ClosingCta.tsx` — the closing panel

Everything else (`#/pricing`, `#/tools`, `#/showcase`, `#/auth`, `#/app/*`, …)
is still the vanilla prototype at the repo root; the router and those pages come
next.
