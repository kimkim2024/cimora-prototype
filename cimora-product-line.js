/* The product page's production line - the static twin of
   web/src/sections/ProductionLine (LineDiagram + the stage columns + CostStrip).
   Geometry is copied from there so both stay the same drawing. */

function plStages() {
  return [
    {
      no: '01',
      title: 'Comic creation',
      href: '#/features/webtoon',
      stat: 'Chapter 01 · 12 panels ready',
      desc: 'From ideas and novels to full stories: confirm the narrative first, then bring characters into the frame.',
    },
    {
      no: '02',
      title: 'Video production',
      href: '#/features/motion-comic',
      stat: '4 shots · 48s · camera stable',
      desc: 'Camera moves, dialogue, subtitles and limited animation form a stable draft. Key actions are left to the enhanced candidates you pick.',
    },
    {
      no: '03',
      title: 'Studio production',
      href: '#/features/studio',
      stat: '6 assets · v2 locked · on budget',
      desc: 'Projects, assets, versions, quality and budget in one place. Make continuous production clearer.',
    },
  ];
}

/* ---- the diagram: story in, three stages, delivered work out --------------- */
function plDiagram() {
  const NODE_Y = 44;
  const NODE_H = 140;
  const NODE_W = 190;
  const NODE_X = [252, 506, 760];
  const LINK_Y = NODE_Y + NODE_H / 2;
  const IN = { x: 20, y: 52, w: 172, h: 116 };
  const OUT = { x: 1014, y: 76, w: 122, h: 76 };
  const stages = plStages();

  const links = [
    { x1: IN.x + IN.w, x2: NODE_X[0], dashed: false },
    { x1: NODE_X[0] + NODE_W, x2: NODE_X[1], dashed: true },
    { x1: NODE_X[1] + NODE_W, x2: NODE_X[2], dashed: true },
    { x1: NODE_X[2] + NODE_W, x2: OUT.x, dashed: false },
  ];

  const glow = NODE_X.map(
    (x, i) =>
      `<rect class="p3l-glow" data-i="${i}" x="${x - 22}" y="${NODE_Y - 22}" width="${NODE_W + 44}" height="${NODE_H + 44}" rx="20" fill="url(#p3l-glow-fill)"/>`,
  ).join('');

  const story = `<g>
    <rect x="${IN.x + 12}" y="${IN.y + 12}" width="${IN.w}" height="${IN.h}" rx="10" class="p3l-f-paper p3l-s-hair"/>
    <rect x="${IN.x + 6}" y="${IN.y + 6}" width="${IN.w}" height="${IN.h}" rx="10" class="p3l-f-paper p3l-s-hair"/>
    <rect x="${IN.x}" y="${IN.y}" width="${IN.w}" height="${IN.h}" rx="10" class="p3l-f-paper p3l-s-strong"/>
    <text x="${IN.x + 14}" y="${IN.y + 22}" class="p3l-t-quiet" font-size="9" letter-spacing="1.4">CHAPTER 01</text>
    <rect x="${IN.x + 14}" y="${IN.y + 32}" width="92" height="7" rx="3.5" class="p3l-f-ink" opacity="0.85"/>
    <rect x="${IN.x + 14}" y="${IN.y + 50}" width="132" height="4" rx="2" class="p3l-f-hair"/>
    <rect x="${IN.x + 14}" y="${IN.y + 60}" width="112" height="4" rx="2" class="p3l-f-hair"/>
    <rect x="${IN.x + 14}" y="${IN.y + 80}" width="66" height="18" rx="9" class="p3l-f-muted p3l-s-hair"/>
    <text x="${IN.x + 47}" y="${IN.y + 93}" text-anchor="middle" class="p3l-t-muted" font-size="9">Story draft</text>
  </g>`;

  const connectors = links
    .map((l, i) => {
      const cls = i === 0 || i === 3 ? 'p3l-link-strong' : 'p3l-link';
      return `<g>
        <line x1="${l.x1}" y1="${LINK_Y}" x2="${l.x2}" y2="${LINK_Y}" stroke-width="1.2" ${l.dashed ? 'stroke-dasharray="3 4"' : ''} class="${cls}"/>
        <circle r="2.4" class="p3l-f-ink">
          <animateMotion dur="${2.1 + (i % 2) * 0.6}s" begin="${i * 0.32}s" repeatCount="indefinite" path="M${l.x1},${LINK_Y} H${l.x2}"/>
        </circle>
      </g>`;
    })
    .join('');

  function nodeInner(i, x) {
    if (i === 0) {
      const cells = [[0, 0], [1, 0], [0, 1], [1, 1]];
      return `<g>${cells
        .map(
          ([cx, cy], k) =>
            `<rect x="${x + 22 + cx * 77}" y="${NODE_Y + 32 + cy * 38}" width="69" height="30" rx="4" stroke-width="1" class="${k < 3 ? 'p3l-f-sunken p3l-s-strong' : 'p3l-f-paper p3l-s-hair'}"/>`,
        )
        .join('')}
        <line x1="${x + 30}" y1="${NODE_Y + 40}" x2="${x + 78}" y2="${NODE_Y + 40}" class="p3l-s-strong" stroke-width="2"/>
        <line x1="${x + 30}" y1="${NODE_Y + 49}" x2="${x + 64}" y2="${NODE_Y + 49}" class="p3l-s-hair" stroke-width="2"/>
      </g>`;
    }
    if (i === 1) {
      return `<g>${[0, 1, 2, 3, 4]
        .map(
          (f) =>
            `<rect x="${x + 22 + f * 30}" y="${NODE_Y + 36}" width="26" height="40" rx="3" stroke-width="1" class="p3l-f-paper p3l-s-hair"/>`,
        )
        .join('')}
        <line x1="${x + 22}" y1="${NODE_Y + 30}" x2="${x + 22}" y2="${NODE_Y + 82}" class="p3l-s-ink" stroke-width="1.4" opacity="0.3"/>
        <path d="M${x + 22} ${NODE_Y + 88} H${x + 168}" class="p3l-s-hair" stroke-width="2" stroke-dasharray="2 3"/>
      </g>`;
    }
    return `<g>${[0, 1, 2]
      .map((r) => {
        const y = NODE_Y + 32 + r * 26;
        const done = r === 2;
        return `<g>
          <rect x="${x + 22}" y="${y}" width="146" height="18" rx="5" stroke-width="1" class="${done ? 'p3l-row-done' : 'p3l-f-sunken p3l-s-hair'}"/>
          <circle cx="${x + 32}" cy="${y + 9}" r="3" class="p3l-f-quiet"/>
          <rect x="${x + 42}" y="${y + 7}" width="${done ? 74 : 56 + r * 12}" height="4" rx="2" class="p3l-f-hair-strong"/>
          ${done ? `<path d="M${x + 150} ${y + 9} l3 3 5-6" fill="none" stroke-width="1.5" class="p3l-s-ink" stroke-linecap="round"/>` : ''}
        </g>`;
      })
      .join('')}
    </g>`;
  }

  const nodes = stages
    .map(
      (s, i) => `<g class="p3l-node" data-i="${i}">
        <rect x="${NODE_X[i]}" y="${NODE_Y}" width="${NODE_W}" height="${NODE_H}" rx="12" stroke-width="1" class="p3l-node-box"/>
        <text x="${NODE_X[i] + 16}" y="${NODE_Y + 22}" class="p3l-t-quiet" font-size="9" letter-spacing="1.2">${s.no}</text>
        ${nodeInner(i, NODE_X[i])}
        <text x="${NODE_X[i] + NODE_W / 2}" y="${NODE_Y + NODE_H - 14}" text-anchor="middle" font-size="10" class="p3l-title">${s.title}</text>
        <text x="${NODE_X[i] + NODE_W / 2}" y="${NODE_Y + NODE_H - 14}" text-anchor="middle" font-size="10" class="p3l-stat">${s.stat}</text>
      </g>`,
    )
    .join('');

  const delivered = `<g>
    <rect x="${OUT.x}" y="${OUT.y}" width="${OUT.w}" height="${OUT.h}" rx="10" class="p3l-f-paper p3l-s-strong"/>
    <circle cx="${OUT.x + 26}" cy="${OUT.y + 26}" r="9" class="p3l-f-accent"/>
    <path d="M${OUT.x + 22} ${OUT.y + 26} l3 3 6-6" fill="none" stroke-width="1.6" class="p3l-s-on-accent" stroke-linecap="round"/>
    <text x="${OUT.x + 44}" y="${OUT.y + 30}" class="p3l-t-ink" font-size="11">Delivered</text>
    <text x="${OUT.x + 14}" y="${OUT.y + 56}" class="p3l-t-quiet" font-size="9" letter-spacing="0.6">PNG · MP4 · v2</text>
  </g>`;

  return `<svg viewBox="0 0 1160 228" class="p3l-svg" role="img" aria-label="One story moving through comic panels, a motion shot and the studio workflow, then out as delivered work">
    <defs>
      <linearGradient id="p3l-glow-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#c8f24e" stop-opacity="0.28"/>
        <stop offset="1" stop-color="#c8f24e" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${glow}
    ${story}
    ${connectors}
    ${nodes}
    ${delivered}
  </svg>`;
}

/* ---- the chapter budget curve --------------------------------------------- */
const PL_BUDGET = { unit: '$', limit: 1.2, values: [0.12, 0.27, 0.39, 0.52, 0.61, 0.74, 0.86, 0.98] };

function plChart() {
  const W = 1160, H = 128, PAD = 14;
  const { values, limit, unit } = PL_BUDGET;
  const n = values.length;
  const lo = Math.min(...values, limit);
  const hi = Math.max(...values, limit);
  const span = hi - lo || 1;
  const points = values.map((v, i) => [
    PAD + (i / (n - 1)) * (W - PAD * 2),
    H - PAD - ((v - lo) / span) * (H - PAD * 2),
  ]);
  const budgetY = H - PAD - ((limit - lo) / span) * (H - PAD * 2);

  let line = '';
  points.forEach(([x, y], i) => {
    if (i === 0) { line = `M${x.toFixed(1)},${y.toFixed(1)}`; return; }
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    line += ` C${cx.toFixed(1)},${py.toFixed(1)} ${cx.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = points[n - 1];
  const area = `${line} L${last[0].toFixed(1)},${(H - PAD).toFixed(1)} L${points[0][0].toFixed(1)},${(H - PAD).toFixed(1)} Z`;

  const svg = `<svg viewBox="0 0 ${W} ${H}" class="p3l-chart" data-pl-chart role="img"
      aria-label="Cumulative chapter spend, ${unit}${values[n - 1].toFixed(2)} of a ${unit}${limit.toFixed(2)} budget"
      data-points='${JSON.stringify(points.map((p) => [Math.round(p[0]), Math.round(p[1])]))}'>
    <defs>
      <linearGradient id="p3l-cost-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#171717" stop-opacity="0.1"/>
        <stop offset="1" stop-color="#171717" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <line x1="${PAD}" y1="${budgetY.toFixed(1)}" x2="${W - PAD}" y2="${budgetY.toFixed(1)}" class="p3l-s-strong" stroke-dasharray="2 4"/>
    <text x="${PAD}" y="${(budgetY - 6).toFixed(1)}" font-size="9" class="p3l-t-quiet" letter-spacing="0.8">BUDGET</text>
    <path d="${area}" fill="url(#p3l-cost-fill)"/>
    <path d="${line}" fill="none" stroke-width="1.8" class="p3l-s-ink"/>
    <line class="p3l-scrub-rule" x1="0" y1="4" x2="0" y2="${H - PAD}" class="p3l-s-ink" stroke-opacity="0.3" opacity="0"/>
    <circle class="p3l-dot" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3.4" class="p3l-f-paper p3l-s-ink" stroke-width="1.6"/>
  </svg>`;

  return { svg, unit, limit, values };
}

function productLine() {
  const stages = plStages();
  const chart = plChart();
  const lastValue = PL_BUDGET.values[PL_BUDGET.values.length - 1];
  const lastPct = Math.round((lastValue / PL_BUDGET.limit) * 100);

  return `<section class="p3l" data-pl-card data-pl-active="0">
    <h2>From creating to continuous production.</h2>

    <div class="p3l-card">
      <div class="p3l-diagram">${plDiagram()}</div>

      <div class="p3l-stages">
        ${stages
          .map(
            (s, i) => `<div class="p3l-stage" data-pl-stage="${i}">
          <div class="p3l-stage-head"><span>${s.no}</span><h3>${s.title}</h3></div>
          <p>${s.desc}</p>
          <a href="${s.href}">Learn more</a>
        </div>`,
          )
          .join('')}
      </div>

      <div class="p3l-cost">
        <div class="p3l-cost-read">
          <p class="p3l-cost-label">Chapter budget</p>
          <p class="p3l-cost-value"><b data-pl-value>${chart.unit}${lastValue.toFixed(2)}</b><span> / ${chart.unit}${chart.limit.toFixed(2)}</span></p>
          <p class="p3l-cost-meta" data-pl-meta>Chapter ${String(PL_BUDGET.values.length).padStart(2, '0')} · ${lastPct}% used</p>
        </div>
        ${chart.svg}
      </div>
    </div>
  </section>`;
}

/* ---- behaviour: hover/auto highlight + budget scrubbing ------------------- */
(() => {
  if (window.__cimoraProductLine) return;
  window.__cimoraProductLine = true;

  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;

  // the strip cycles through the three stages, and a pointer holds it still
  function startCycle() {
    if (timer) return;
    timer = setInterval(() => {
      const card = document.querySelector('[data-pl-card]');
      if (!card || !card.isConnected) return;
      if (reduced() || card.matches(':hover') || card.dataset.plPinned === '1') return;
      const next = (Number(card.dataset.plActive || 0) + 1) % 3;
      card.dataset.plActive = String(next);
    }, 2800);
  }
  startCycle();

  function setActive(card, index) {
    card.dataset.plActive = String(index);
  }

  document.addEventListener('pointerover', (event) => {
    const stage = event.target.closest?.('[data-pl-stage]');
    const card = event.target.closest?.('[data-pl-card]');
    if (!card) return;
    if (stage) {
      card.dataset.plPinned = '1';
      setActive(card, Number(stage.dataset.plStage));
    }
  });

  document.addEventListener('pointerout', (event) => {
    const card = event.target.closest?.('[data-pl-card]');
    if (!card) return;
    const to = event.relatedTarget;
    if (to && card.contains(to)) return;
    card.dataset.plPinned = '0';
  });

  // scrubbing the budget curve
  function scrub(event) {
    const svg = event.target.closest?.('[data-pl-chart]');
    if (!svg) return;
    const card = svg.closest('[data-pl-card]');
    const points = JSON.parse(svg.dataset.points || '[]');
    if (!points.length) return;
    const box = svg.getBoundingClientRect();
    if (!box.width) return;
    const x = ((event.clientX - box.left) / box.width) * 1160;
    let best = 0;
    for (let i = 1; i < points.length; i += 1) {
      if (Math.abs(points[i][0] - x) < Math.abs(points[best][0] - x)) best = i;
    }
    const [px, py] = points[best];
    const dot = svg.querySelector('.p3l-dot');
    const rule = svg.querySelector('.p3l-scrub-rule');
    if (dot) { dot.setAttribute('cx', px); dot.setAttribute('cy', py); }
    if (rule) { rule.setAttribute('x1', px); rule.setAttribute('x2', px); rule.setAttribute('opacity', '1'); }
    const value = PL_BUDGET.values[best];
    const valueEl = card?.querySelector('[data-pl-value]');
    const metaEl = card?.querySelector('[data-pl-meta]');
    if (valueEl) valueEl.textContent = `${PL_BUDGET.unit}${value.toFixed(2)}`;
    if (metaEl) metaEl.textContent = `Chapter ${String(best + 1).padStart(2, '0')} · ${Math.round((value / PL_BUDGET.limit) * 100)}% used`;
  }

  document.addEventListener('pointermove', scrub);

  document.addEventListener('pointerleave', (event) => {
    const svg = event.target.closest?.('[data-pl-chart]');
    if (!svg) return;
    const points = JSON.parse(svg.dataset.points || '[]');
    if (!points.length) return;
    const last = points[points.length - 1];
    const dot = svg.querySelector('.p3l-dot');
    const rule = svg.querySelector('.p3l-scrub-rule');
    if (dot) { dot.setAttribute('cx', last[0]); dot.setAttribute('cy', last[1]); }
    if (rule) rule.setAttribute('opacity', '0');
    const card = svg.closest('[data-pl-card]');
    const valueEl = card?.querySelector('[data-pl-value]');
    const metaEl = card?.querySelector('[data-pl-meta]');
    const value = PL_BUDGET.values[PL_BUDGET.values.length - 1];
    if (valueEl) valueEl.textContent = `${PL_BUDGET.unit}${value.toFixed(2)}`;
    if (metaEl) metaEl.textContent = `Chapter ${String(PL_BUDGET.values.length).padStart(2, '0')} · ${Math.round((value / PL_BUDGET.limit) * 100)}% used`;
  }, true);
})();
