# prototype-20261116 — the 2026-11-16 demo build

This folder is the client's packaged demo (`Cimora-Demo-20261116-Win-Mac.zip`,
packaged 2026-11-16), imported here verbatim except for generated output. It is a
**separate prototype version**, not a replacement for the files at the repo root:

| | root prototype (`/`) | this build (`/prototype-20261116/`) |
| --- | --- | --- |
| Architecture | one `index.html`, hash routes, `site-*.js` + `cimora-*.js` modules | one HTML file per page (`product/`, `pricing/`, `tools/*`, `market/`, `showcase/`, …) plus `app.js` |
| Language | English | Chinese |
| Accent | lime `#c8f24e` | purple |
| Extras | — | market, community, export center, task center, points wallet, studio library, 14 tool pages, video storyboard/flow, comic studio examples |

## How to open it

- **From disk (as shipped):** unzip, then open `开始体验.html` (Windows/macOS). The
  `portable-*.js` bundles inline the media so it works from `file://` with no server.
- **From the repo preview server:** `http://127.0.0.1:4173/prototype-20261116/index.html`
  (`node tools/preview.js` at the repo root).

## What was left out of the import

Skipped on purpose to keep the repository sane — none of it is source:

| Skipped | Size | Why |
| --- | --- | --- |
| `comic-studio/examples/**/deliverables/*.zip` (6 files) | 77 MB | exported sample episodes |
| images larger than 1 MB (49 files) | ~135 MB | rendered proof / deliverable pages for the comic demonstrations |

If a comic demonstration page looks incomplete, copy those files back from the
original zip.

## Notes

- Both `index.html` and the sub-pages use **relative** links, so the folder works at
  any path, including the preview server.
- The build is not wired to `tools/ui-lint.js` / `tools/shots.js` (those check the
  root prototype's routes), and it is not mirrored by the React app in `web/`.
- The root prototype still carries work this build predates: the device-mockup hero,
  the production-line module, the project library from PR #2, the sticky header and
  the scroll guard.
