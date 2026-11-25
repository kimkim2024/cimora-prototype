/* Cimora vanilla adaptation of Sticker Slap Footer. No runtime dependencies. */
(function () {
"use strict";
if (window.CimoraStickerFooter) return;
const hash = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

const round = (v) => Math.round(v * 100) / 100

const clamp = (v, lo, hi) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo)

/**
 * A fat single-stroke script: [advance, main stroke, pen-lift strokes, lifts
 * after?]. x-height 10, baseline 0, y runs down. Every main stroke starts at
 * (0, -1) and, unless it lifts, ends at (advance, -1), so letters chain into
 * one continuous path. Absolute M / L / C only, so x and y simply alternate.
 */
const SCRIPT = {
  a: [10.2, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -10L7.8 -3C7.8 -0.8 8.8 -1 10.2 -1"],
  b: [9.4, "M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -1L1.8 -6C2.4 -9 3.4 -10 4.8 -10C6.8 -10 8.2 -8 8.2 -5C8.2 -2 6.6 0 4.8 0C3.4 0 2.4 -0.6 1.8 -1.6C2.4 -0.6 3.4 0 4.8 0C6.6 0 7.8 -0.8 9.4 -1"],
  c: [8.8, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C5.6 -10 6.6 -9.6 7 -8.6C6.6 -9.6 5.6 -10 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6 0 7 -1 8.8 -1"],
  d: [10.2, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -19L7.8 -3C7.8 -0.8 8.8 -1 10.2 -1"],
  e: [9.4, "M0 -1C3.4 -2.4 8 -4.4 8 -7.6C8 -9.4 6.6 -10.4 4.8 -10.4C2.2 -10.4 0.8 -7.8 0.8 -5C0.8 -1.8 2.6 0 5 0C6.8 0 8 -1 9.4 -1"],
  f: [7, "M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 7.2C1.8 9.6 3.2 9.6 3.8 7.6C4.4 5 4.8 -1 7 -1", "M-0.4 -9.4L5.4 -9.4"],
  g: [9.6, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -10L7.8 4C7.8 8.6 5.8 9.6 4.2 9.6C2 9.6 1.4 7.6 2.8 6C4.6 4 7.4 1.4 9.6 -1"],
  h: [10, "M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -1L1.8 -5.6C2.6 -8.6 4 -10 5.6 -10C7.2 -10 7.8 -8.8 7.8 -7L7.8 -3C7.8 -0.8 8.8 -1 10 -1"],
  i: [5, "M0 -1C1.2 -1.4 2 -6 2.2 -10L2.2 -3C2.2 -0.8 3.4 -1 5 -1", "M2.4 -15.2L2.5 -15.3"],
  j: [5.4, "M0 -1C1.2 -1.4 2 -6 2.2 -10L2.2 4.6C2.2 9.6 -0.6 9.8 -0.2 7.4C0.2 5 3.4 1.4 5.4 -1", "M2.4 -15.2L2.5 -15.3"],
  k: [9.6, "M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -1L1.8 -4.6C3 -8 5.6 -10.4 7 -9.6C8.4 -8.6 7 -5.6 3.6 -5C5.6 -4.6 6.6 -1 9.6 -1"],
  l: [6.4, "M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -3.2C1.8 -0.6 4 -1 6.4 -1"],
  m: [14.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.4 -8.6 3.4 -10 4.8 -10C6.2 -10 7 -9 7 -7L7 -1L7 -5.6C7.6 -8.6 8.6 -10 10 -10C11.4 -10 12.2 -9 12.2 -7L12.2 -3C12.2 -0.8 13.2 -1 14.6 -1"],
  n: [9.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.4 -8.6 3.4 -10 4.8 -10C6.4 -10 7.2 -9 7.2 -7L7.2 -3C7.2 -0.8 8.2 -1 9.6 -1"],
  o: [9, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5C7.6 -7.8 6.1 -10 4.3 -10C6 -10 7.4 -9.2 9 -9", "", 1],
  p: [9.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 9L1.8 -5.6C2.4 -8.6 3.4 -10 5 -10C7 -10 8.2 -8 8.2 -5C8.2 -2 6.6 0 4.8 0C3.4 0 2.4 -0.6 1.8 -1.6C2.4 -0.6 3.4 0 4.8 0C6.6 0 7.8 -0.8 9.6 -1"],
  q: [10.4, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -10L7.8 9C8.8 6 9 0 10.4 -1"],
  r: [8.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.6 -8.6 4.2 -10 5.8 -10C6.8 -10 7.6 -9.6 8.2 -8.8", "", 1],
  s: [8.4, "M0 -1C1.6 -2 3 -7 4.4 -10.2C5.6 -8 7.4 -6 7.4 -3.6C7.4 -1.2 5.6 0 3.6 0C2 0 1 -0.6 0.6 -1.6C1 -0.6 2 0 3.6 0C5.6 0 6.8 -0.8 8.4 -1"],
  t: [6.6, "M0 -1C1 -1.4 2.2 -8 2.4 -15L2.4 -3.2C2.4 -0.8 4 -1 6.6 -1", "M-0.8 -9.6L6.2 -9.6"],
  u: [10, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -3.6C1.8 -1 3 0 4.6 0C6.2 0 7.4 -1.4 7.6 -4L7.6 -9.8L7.6 -3C7.6 -0.8 8.6 -1 10 -1"],
  v: [9, "M0 -1C1.2 -1.6 1.6 -6 1.6 -9.6C1.6 -6 2.6 0 4.4 0C6.4 0 7.6 -6 7.6 -9.6C8 -9 8.4 -8.8 9 -8.8", "", 1],
  w: [12.6, "M0 -1C1.2 -1.6 1.6 -6 1.6 -9.6L1.6 -3.6C1.6 -1 2.6 0 4 0C5.4 0 6.2 -1 6.2 -3.6L6.2 -8L6.2 -3.6C6.2 -1 7 0 8.4 0C9.8 0 10.8 -1 10.8 -3.6L10.8 -9.6C11.2 -9 11.8 -8.8 12.6 -8.8", "", 1],
  x: [9, "M0 -1C1.6 -2 2 -8.6 3 -9.6L7 -1C7.6 -0.4 8.4 -1 9 -1", "M7.4 -9.6L2.4 -0.4"],
  y: [9.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -3.6C1.8 -1 3 0 4.6 0C6.2 0 7.4 -1.4 7.6 -4L7.6 -9.8L7.6 4.4C7.6 9 5.6 9.6 4.2 9.6C2 9.6 1.4 7.6 2.8 6C4.6 4 7.4 1.6 9.6 -1"],
  z: [8.8, "M0 -1C1 -2 1.4 -9.6 2.6 -9.6L7.4 -9.6L1.6 -0.2L6 -0.2C7 -0.2 7.8 -1 8.8 -1"],
  "!": [4, "M2 -16L2 -4.4", "M2 -0.6L2.1 -0.7", 1],
  ".": [3.6, "M1.8 -0.6L1.9 -0.7", "", 1],
}

/** Horizontal stretch and the gap between letters, in script units. */
const SX = 1.22
const TRACK = 1
const WORD_GAP = 6

/** Shifts and stretches every x in an absolute M/L/C path. */
const place = (d, dx, sx = SX) => {
  let k = 0
  return d.replace(/-?\d*\.?\d+/g, (n) => (k++ % 2 === 0 ? String(round(+n * sx + dx)) : n))
}




const extent = (d) => {
  const n = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number)
  return n.filter((_, i) => i % 2 === 1)
}

/**
 * Lays text out in the script: one continuous main stroke (moves only where a
 * letter lifts or a space falls) plus the pen-lift strokes, drawn after.
 * Case is ignored, accents are stripped, anything unknown is a space.
 */
const layoutScript = (text) => {
  const clean = String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
  let x = 0
  let main = ""
  const extra = []
  const boxes = []
  let lift = true
  let top = 0
  let bottom = 0
  for (const ch of clean) {
    const g = SCRIPT[ch]
    if (!g) {
      if (main) x += WORD_GAP
      lift = true
      continue
    }
    const d = place(g[1], x)
    main += lift ? d : "L" + d.slice(1)
    if (g[2]) extra.push(place(g[2], x))
    const ys = extent(g[1] + (g[2] ?? ""))
    const t = Math.min(...ys)
    top = Math.min(top, t)
    bottom = Math.max(bottom, ...ys)
    boxes.push({ x0: round(x), x1: round(x + g[0] * SX), top: t })
    lift = !!g[3]
    x += g[0] * SX + TRACK
  }
  return { main, extra, width: boxes.length ? round(x - TRACK) : 0, top, bottom, boxes }
}

/** A closed star: `points` spikes, alternating radii. `wobble` makes the spikes uneven, like a hand-cut sticker. */
const starPath = (
  points,
  outer,
  inner,
  cx = 0,
  cy = 0,
  wobble = 0,
  seed = 0,
) => {
  const n = Math.max(3, Math.floor(points) || 3)
  const pts = []
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 ? inner : outer * (1 + (hash(i * 9.7 + seed) - 0.5) * wobble)
    pts.push(round(cx + Math.cos(a) * r) + " " + round(cy + Math.sin(a) * r))
  }
  return "M" + pts.join("L") + "Z"
}



/**
 * Where n stickers land on a word, in script units: spread evenly along it,
 * each riding the top of the letter underneath (some perched above it, some
 * slapped across the stroke), with a seeded tilt and a parallax depth.
 */
const stickerSpots = (word, n, seed = 0) => {
  const count = Math.max(0, Math.floor(n) || 0)
  if (!count || !word.width) return []
  return Array.from({ length: count }, (_, i) => {
    const x = ((i + 0.5) / count) * word.width
    const box = word.boxes.find((b) => x >= b.x0 && x <= b.x1 + TRACK) ?? word.boxes[word.boxes.length - 1]
    const lift = [1.5, -5, -1, -7, 0.5, -4, -2][i % 7]
    return {
      x: round(x + (hash(i * 4.1 + seed) - 0.5) * 3),
      y: round(clamp(box.top + 2.5 + lift, word.top - 4, -4)),
      size: round(6.4 + hash(i * 2.3 + seed + 1) * 2.4),
      rotate: round((hash(i * 7.7 + seed + 2) - 0.5) * 34),
      depth: round(0.4 + hash(i * 5.5 + seed + 3) * 0.8),
    }
  })
}

const STROKE = 3.3, SLANT = .1584, CUT = -1.2;
const word = layoutScript('cimora');
const pad = STROKE / 2 + .6, vbX = -1.4 - pad, vbY = word.top - pad;
const vbW = word.width + 2.8 + pad * 2 - word.top * SLANT;
const vbH = word.bottom + pad - vbY, cutH = CUT - vbY;
const smallVb = [-pad-1,word.top-pad,word.width+pad*2+2-word.top*SLANT,-word.top+pad*2+1].map(round).join(' ');
const drawDur = clamp(.7 + word.width / 45,1.1,2.6), writeAt = 1.05;
const kinds = ['burst','smiley','heart','daisy','bubble','camera'];
const spots = stickerSpots(word,kinds.length,3).map(s => {
  const x=(s.x-s.y*SLANT-vbX)/vbW*100, y=(s.y-vbY)/vbH*100;
  const xf=clamp(x/100*vbW+vbX,0,word.width)/word.width;
  return {...s,x,y,size:s.size/vbW*100,delay:writeAt+drawDur*Math.pow(xf,.92)+.08};
});
let serial=0;
const esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path = (d, attrs='') => `<path d="${d}" ${attrs}/>`;
function scriptText(text,cx,cy,w,color,stroke) {
  const a=layoutScript(text), s=w/(a.width+stroke), h=(-a.top+1)*s;
  return `<g transform="translate(${round(cx-a.width*s/2)} ${round(cy+h/2-s)}) scale(${round(s)})">${path(a.main+a.extra.join(''),`fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`)}</g>`;
}
const sparkle=(cx,cy,r)=>`M${cx} ${cy-r}Q${cx} ${cy} ${cx+r} ${cy}Q${cx} ${cy} ${cx} ${cy+r}Q${cx} ${cy} ${cx-r} ${cy}Q${cx} ${cy} ${cx} ${cy-r}Z`;
const BURST=starPath(13,54,39,60,60,.2,4);
const HEART='M60 100C22 76 10 56 18 38C26 20 50 18 60 38C70 18 94 20 102 38C110 56 98 76 60 100Z';
const BUBBLE='M24 22H96A14 14 0 0 1 110 36V70A14 14 0 0 1 96 84H56L34 102L38 84H24A14 14 0 0 1 10 70V36A14 14 0 0 1 24 22Z';
function stickerSvg(kind,id) {
  let shape='',art='';
  switch(kind) {
    case 'burst': shape=path(BURST); art=path(BURST,'fill="#ff6a2b"')+path(starPath(13,44,33,60,60,.2,4),'fill="#ff8a4c"')+scriptText('wow',60,58,62,'#1b1230',3.4); break;
    case 'smiley': shape='<circle cx="60" cy="60" r="50"/>'; art='<circle cx="60" cy="60" r="50" fill="#9ab8ff"/><circle cx="60" cy="60" r="40" fill="none" stroke="#fff" stroke-width="3" opacity=".9"/><ellipse cx="47" cy="50" rx="4" ry="7.5" fill="#fff"/><ellipse cx="73" cy="50" rx="4" ry="7.5" fill="#fff"/>'+path('M36 66Q60 92 84 66M32 63L39 69M88 63L81 69','fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"'); break;
    case 'heart': shape=path(HEART)+path(sparkle(100,20,14))+path(sparkle(18,92,10)); art=path(HEART,'fill="#b0245e"')+path('M30 42Q32 30 45 29','fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" opacity=".9"')+path(sparkle(100,20,14),'fill="#ffd0e3"')+path(sparkle(18,92,10),'fill="#ffd0e3"'); break;
    case 'bubble': shape=path(BUBBLE); art=path(BUBBLE,'fill="#ffb6e1"')+scriptText('hi!',60,53,44,'#8a1550',3.6); break;
    case 'daisy': shape=Array.from({length:9},(_,i)=>`<ellipse cx="60" cy="31" rx="13" ry="22" transform="rotate(${i*40} 60 60)"/>`).join(''); art=`<g fill="#ffd23f">${shape}</g><circle cx="60" cy="60" r="19" fill="#ff6a2b"/><circle cx="53.5" cy="57" r="2.6" fill="#1b1230"/><circle cx="66.5" cy="57" r="2.6" fill="#1b1230"/>`+path('M53 65Q60 71 67 65','fill="none" stroke="#1b1230" stroke-width="3" stroke-linecap="round"'); break;
    case 'camera': shape='<rect x="12" y="36" width="96" height="66" rx="16"/><rect x="38" y="24" width="36" height="20" rx="6"/>'; art=`<g fill="#1d1c22">${shape}</g><circle cx="60" cy="70" r="24" fill="#fff"/><circle cx="60" cy="70" r="17" fill="#1d1c22"/><circle cx="60" cy="70" r="11" fill="#5b7cff"/><circle cx="55" cy="65" r="4" fill="#fff"/><rect x="86" y="46" width="12" height="7" rx="3" fill="#ffd23f"/>`+path('M22 50H30','stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"'); break;
  }
  return `<svg viewBox="-6 -6 132 132" aria-hidden="true" focusable="false"><defs><clipPath id="${id}c">${shape}</clipPath><linearGradient id="${id}g" x1="0" x2="1" y1="0" y2="0"><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset=".65" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><g fill="#fff" stroke="#fff" stroke-width="11" stroke-linejoin="round">${shape}</g>${art}<g clip-path="url(#${id}c)"><g transform="rotate(20 60 60)"><rect class="csf-sheen" x="-30" y="-30" width="180" height="180" fill="url(#${id}g)"/></g></g></svg>`;
}
const columns=[
  ['Create',[['Comic Creation','#/app/new?output=comic'],['Video Creation','#/app/new?output=motion'],['Infinite Canvas','#/app/new?view=canvas']]],
  ['Explore',[['Showcase','#/showcase'],['Templates','#/templates'],['Guides','#/resources']]],
  ['Support',[['Help Center','#/help'],['Privacy & Data','#/legal/privacy'],['Terms of Service','#/legal/terms']]]
];
function render() {
  const id='csf-'+(++serial);
  return `<link rel="stylesheet" href="cimora-sticker-footer.css"><footer class="slap csf" aria-label="Cimora footer" style="--csf-ar:${round(vbW/cutH)}">
    <div class="csf-top"><a class="csf-nav" href="#/tools"><svg viewBox="-50 -50 100 100" aria-hidden="true">${path(starPath(11,48,30,0,0,.3,7),'fill="currentColor"')}</svg><span>Explore</span></a>
    <a class="csf-logo" href="#/" aria-label="Cimora, home"><svg viewBox="${smallVb}" aria-hidden="true">${path(word.main+word.extra.join(''),'data-draw transform="skewX(-9)"')}</svg></a>
    <a class="csf-chat" href="#/app/new"><svg viewBox="0 0 24 24" aria-hidden="true">${path('M12 2.6A9.4 9.4 0 0 0 3.9 16.8L2.7 21.3L7.3 20.1A9.4 9.4 0 1 0 12 2.6Z','fill="currentColor"')}${path('M8 10H16M8 14H13','fill="none" stroke="var(--csf-paper)" stroke-width="1.8" stroke-linecap="round"')}</svg><span>Let’s create</span></a></div>
    <div class="csf-panel"><nav class="csf-cols" aria-label="Footer navigation">${columns.map(([title,links],c)=>`<section class="csf-col" style="--c:${c}" aria-label="${title}"><h3 class="csf-tag">${title}</h3><ul class="csf-big">${links.map(([label,href],i)=>`<li class="csf-line" style="--i:${i}"><a href="${esc(href)}">${esc(label)}</a></li>`).join('')}</ul>${c===2?'<p class="csf-note">Local demo.</p>':''}</section>`).join('')}</nav>
    <div class="csf-stage"><div class="csf-stage-in" style="margin-bottom:${round(-(vbH-cutH)/vbW*100)}%">
    <button class="csf-wm-btn" type="button" aria-label="Write cimora again and reset stickers" title="Replay the lettering"><svg class="csf-wm" viewBox="${[vbX,vbY,vbW,vbH].map(round).join(' ')}" aria-hidden="true"><g transform="skewX(-9)">${path(word.main,`data-draw style="--dur:${drawDur}s;--at:${writeAt}s"`)}${word.extra.map((d,k)=>path(d,`data-draw style="--dur:.28s;--at:${round(writeAt+drawDur+k*.16)}s"`)).join('')}</g></svg></button>
    ${spots.map((s,i)=>`<div class="csf-st" data-sticker="${i}" style="left:${s.x}%;top:${s.y}%;width:max(${round(s.size)}cqw,46px);--r:${s.rotate}deg;--d:${s.depth};--at:${round(s.delay)}s"><button type="button" class="csf-st-btn" aria-label="${kinds[i]} sticker. Drag or use arrow keys to move. Enter or Home resets it." title="Drag to move · double-click to reset"><span class="csf-st-slap"><span class="csf-st-lift">${stickerSvg(kinds[i],id+'-'+i)}</span></span></button><span class="csf-ring" aria-hidden="true"></span></div>`).join('')}</div></div>
    <div class="csf-credits"><div class="csf-pop" id="${id}-credits" role="dialog" aria-label="Footer credits" hidden><ul><li><b>Design</b><strong>Sticker Slap Footer reference</strong></li><li><b>Adaptation</b><strong>Cimora</strong></li></ul><button type="button" class="csf-close">Close credits</button></div><button type="button" class="csf-pill" aria-haspopup="dialog" aria-controls="${id}-credits" aria-expanded="false" style="--end:${round(writeAt+drawDur+word.extra.length*.16+.5)}s">credits</button></div>
    <span class="csf-sr" role="status" aria-live="polite"></span></div></footer>`;
}
function mount(root) {
  const abort=new AbortController(), signal=abort.signal;
  const on=(target,type,fn,options={})=>target.addEventListener(type,fn,{...options,signal});
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const stage=root.querySelector('.csf-stage-in'), hosts=[...root.querySelectorAll('.csf-st')];
  const pop=root.querySelector('.csf-pop'), credit=root.querySelector('.csf-pill'), close=root.querySelector('.csf-close');
  const status=root.querySelector('[role=status]');
  let io=null, raf=0, drag=null, z=3, disposed=false;
  const animations=new Set();
  function animate(el,frames,duration) {
    if(reduced() || !el.animate) return;
    const a=el.animate(frames,{duration,easing:'cubic-bezier(.3,1.4,.4,1)'});
    animations.add(a); a.onfinish=a.oncancel=()=>animations.delete(a);
  }
  const slap=el=>animate(el,[{transform:'scale(1.14)'},{transform:'scale(.93,1.04)',offset:.4},{transform:'scale(1.02,.98)',offset:.7},{transform:'none'}],420);
  function locate(host,x,y) {host.style.left=x+'%';host.style.top=y+'%';}
  function home(host,feedback=true) {
    const i=Number(host.dataset.sticker); locate(host,spots[i].x,spots[i].y);
    host.style.setProperty('--tilt','0deg');
    if(feedback) {slap(host.querySelector('.csf-st-lift'));status.textContent=kinds[i]+' sticker reset.';}
  }
  function finish(e) {
    if(!drag || (e && drag.id!==e.pointerId)) return;
    const d=drag;drag=null;
    if(d.btn.hasPointerCapture(d.id)) d.btn.releasePointerCapture(d.id);
    d.host.classList.remove('is-drag');d.host.style.setProperty('--tilt','0deg');
    if(d.went) slap(d.btn.querySelector('.csf-st-lift'));
  }
  root.querySelectorAll('[data-draw]').forEach(p=>{try{p.style.setProperty('--l',Math.ceil(p.getTotalLength())+1+'px');}catch(_){/* SVG fallback length remains visible after reveal. */}});
  function enter(){root.classList.add('is-in');io?.disconnect();}
  if('IntersectionObserver' in window) {io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))enter();},{threshold:.2});io.observe(root);} else enter();
  function scroll(){raf=0;if(disposed)return;const r=root.getBoundingClientRect(),vh=document.documentElement.clientHeight||r.height;const p=clamp((vh-r.top)/(Math.min(r.height,vh)||1),0,1);root.style.setProperty('--csf-sp',(1-Math.pow(1-p,2)).toFixed(4));}
  function queue(){if(!raf)raf=requestAnimationFrame(scroll);}
  scroll();on(window,'scroll',queue,{passive:true,capture:true});on(window,'resize',queue);
  on(root,'focusin',enter); // Keyboard visitors never encounter invisible controls.
  on(root,'pointermove',e=>{if(e.pointerType!=='mouse'||reduced())return;const r=root.getBoundingClientRect();if(!r.width||!r.height)return;root.style.setProperty('--csf-px',((e.clientX-r.left)/r.width-.5)*2);root.style.setProperty('--csf-py',((e.clientY-r.top)/r.height-.5)*2);});
  on(root,'pointerleave',()=>{root.style.setProperty('--csf-px',0);root.style.setProperty('--csf-py',0);});
  hosts.forEach(host=>{
    const btn=host.querySelector('button');
    on(btn,'pointerdown',e=>{
      if(e.button!==0||drag)return;const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;
      btn.setPointerCapture(e.pointerId);host.style.zIndex=++z;
      drag={host,btn,id:e.pointerId,sx:parseFloat(host.style.left),sy:parseFloat(host.style.top),px:e.clientX,py:e.clientY,lx:e.clientX,t:performance.now(),tilt:0,w:r.width,h:r.height,went:false};
    });
    on(btn,'pointermove',e=>{
      const d=drag;if(!d||d.id!==e.pointerId||d.btn!==btn)return;
      const dx=e.clientX-d.px,dy=e.clientY-d.py;if(!d.went&&Math.hypot(dx,dy)<4)return;
      d.went=true;host.classList.add('is-drag');
      locate(host,clamp(d.sx+dx/d.w*100,1,99),clamp(d.sy+dy/d.h*100,-70,96));
      const now=performance.now(),v=(e.clientX-d.lx)/Math.max(1,now-d.t);d.tilt=d.tilt*.75+clamp(v*22,-24,24)*.25;d.lx=e.clientX;d.t=now;
      host.style.setProperty('--tilt',reduced()?'0deg':d.tilt.toFixed(2)+'deg');
    });
    on(btn,'pointerup',finish);on(btn,'pointercancel',finish);on(btn,'lostpointercapture',finish);
    on(btn,'dblclick',()=>{finish();home(host);});
    on(btn,'keydown',e=>{
      const step=e.shiftKey?6:2,go={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];
      if(go){e.preventDefault();host.style.zIndex=++z;locate(host,clamp(parseFloat(host.style.left)+go[0],1,99),clamp(parseFloat(host.style.top)+go[1],-70,96));}
      else if(['Home','Enter','Escape'].includes(e.key)){e.preventDefault();finish();home(host);}
    });
    on(btn,'click',e=>{if(e.detail===0)home(host);});
  });
  on(root.querySelector('.csf-wm-btn'),'click',()=>{
    finish();hosts.forEach(h=>home(h,false));
    if(!reduced()){
      const els=root.querySelectorAll('.csf-wm path,.csf-st-slap,.csf-ring');
      els.forEach(el=>{el.style.animation='none';});void root.offsetWidth;
      els.forEach(el=>{el.style.removeProperty('animation');});
    }
    status.textContent='Cimora lettering replayed. Stickers reset.';
  });
  function setOpen(open,restore=true){pop.hidden=!open;credit.setAttribute('aria-expanded',String(open));if(open)close.focus();else if(restore)credit.focus();}
  on(credit,'click',()=>setOpen(pop.hidden));on(close,'click',()=>setOpen(false));
  on(document,'pointerdown',e=>{if(!pop.hidden&&!root.querySelector('.csf-credits').contains(e.target))setOpen(false,false);});
  on(document,'keydown',e=>{if(!pop.hidden&&e.key==='Escape'){e.preventDefault();e.stopPropagation();setOpen(false);}});
  on(pop,'keydown',e=>{if(e.key==='Tab'){e.preventDefault();close.focus();}});
  return ()=>{disposed=true;finish();abort.abort();io?.disconnect();cancelAnimationFrame(raf);animations.forEach(a=>a.cancel());animations.clear();};
}
// The lightweight route watcher persists to discover future footers. All per-footer
// event listeners, IntersectionObservers, animation frames and animations are disposed.
const mounted=new Map();
function sync(){
  mounted.forEach((dispose,el)=>{if(!el.isConnected){dispose();mounted.delete(el);}});
  document.querySelectorAll('footer.slap.csf').forEach(el=>{if(!mounted.has(el))mounted.set(el,mount(el));});
}
const watcher=new MutationObserver(sync);
watcher.observe(document.documentElement,{childList:true,subtree:true});
window.CimoraStickerFooter=Object.freeze({render});
sync();

})();
