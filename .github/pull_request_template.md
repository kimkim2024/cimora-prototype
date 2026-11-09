# PR checklist - every page change goes through this
#
# Branch name:  ui/<area>       e.g. ui/asset-library
# One PR = one page (one cimora-<area>.css, plus its .js if it has behaviour).

## What this PR changes

<!-- page + route, in one line. e.g. Asset Library #/app/assets -> light token system -->

## Files touched

- [ ] only `cimora-<area>.css` (+ optional `cimora-<area>.js`) and one line in `index.html`
- [ ] no edits to `site.css`, `site-refinements.css`, `cimora.css`, `site-core.js`, `cimora-pages.js`, `site-workspace.js`
- [ ] file added to `CONFIG.tokenised` in `tools/ui-lint.js`

## Checks

Paste the two command outputs:

```
$ npm run lint
ui-lint  0 error(s), N warning(s)

$ npm run shots -- --only=<page>
  ok  /app/<page>   .... chars   0 cjk   0 arrow   1440px:...KB 1920px:...KB
```

## Visual proof

- [ ] `1440px` before / after screenshots attached to this PR (drag the PNGs in, do not commit them)
- [ ] `1920px` after screenshot attached
- [ ] states covered: default · hover · focus (tab) · empty · loading · error · long text

## Spec

- [ ] every value is a token from `design/tokens.css` (no literal hex / off-scale size / off-grid spacing)
- [ ] one accent per screen, no second brand colour, no gradient button
- [ ] English copy, no arrow glyphs
- [ ] desktop breakpoints only (1440 / 1280 / 1920)
- [ ] reduced-motion respected for every animation
- [ ] nothing outside the requested page was restyled
