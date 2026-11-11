# Cimora — interactive prototype

A static, framework-free prototype of the Cimora studio: the public site, the creation space (`#/app`), the My Projects glass-folder cards, and the design system that keeps them consistent.

**No build step.** Plain HTML, CSS and vanilla JS. Open `index.html` directly, or serve it:

```bash
npm run preview      # http://127.0.0.1:4173/    (optional, nicer for reviews)
```

Routes worth knowing: `#/` (site) · `#/app` (creation space) · `#/app/projects` · `#/styleguide` (the design system).

## Real UI (`web/`)

New work is no longer a mockup: the product UI is being rebuilt in **React 19 + TypeScript + Tailwind 4** under [`web/`](web/). The prototype above stays as the interactive reference while pages move over one at a time.

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # theme check → type check → dist/
```

First section ported: "From creating to continuous production" (live production line + chapter budget curve). See [`web/README.md`](web/README.md).

## Design system

| What | Where |
|---|---|
| **Spec for AI agents and new contributors** | [`design/AI-SPEC.md`](design/AI-SPEC.md) — read this first |
| Human rationale + decision log (Chinese) | [`design/DESIGN-SYSTEM.md`](design/DESIGN-SYSTEM.md) |
| The only source of values | [`design/tokens.css`](design/tokens.css) |
| Live reference of every approved component | `#/styleguide` — [`cimora-styleguide.css`](cimora-styleguide.css) |
| Self-hosted fonts (Space Grotesk, Instrument Serif, Bricolage Grotesque) | [`design/fonts.css`](design/fonts.css) + `assets/fonts/` |

## Checks

```bash
npm run lint     # tokens, scale, namespacing, assets  -> 0 errors expected
npm run shots    # 12 routes x 1440/1920 screenshots + rendered-text checks
                 # (CJK, arrow glyphs, empty pages)  -> writes shots/
```

Both are dependency-free Node scripts; `shots` drives the installed Chrome or Edge.

## Collaborating

1. Branch: `ui/<area>` (one page per branch, one `cimora-<area>.css` per page).
2. Do the work following `design/AI-SPEC.md`.
3. Run both checks and paste the output into the PR.
4. Attach before/after screenshots at 1440 (and one at 1920) to the PR — do not commit them.
5. `main` is protected: it lands only through a reviewed pull request.

Binary media (`png / jpg / webp / mp4`) is stored in **Git LFS**. Run `git lfs install` once after cloning, otherwise those files arrive as pointers.

## Notes

- AI generation, billing and publishing are **simulated**; the prototype stores data in `localStorage` (`framein-site-v3`, `cimora-comic-studio-v3`, `cimora-script-studio-v3`).
- Desktop only by design: 1440 and 1920 are the review widths.
- `使用说明.txt` is the short delivery note that ships inside the exported zip.
