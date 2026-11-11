import { useState } from 'react';
import { BUDGET } from '../../data/product';
import { chartPaths, nearestIndex, valueY } from '../../lib/chart';

const W = 1160;
const H = 128;
const PAD = 14;

type Props = { reduced: boolean; inView: boolean };

/**
 * Chapter spend against the budget. Pointer scrubs the curve; the readout
 * follows, so the section answers "what will this cost me" without a table.
 */
export function CostStrip({ reduced, inView }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const { values, limit, unit } = BUDGET;
  const { line, area, points } = chartPaths(values, W, H, PAD);
  const budgetY = valueY(limit, [...values, limit], H, PAD);
  const last = points[points.length - 1];
  const shown = hover ?? points.length - 1;
  const point = points[shown];
  const pct = Math.round((values[shown] / limit) * 100);

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    if (!box.width) return;
    const x = ((event.clientX - box.left) / box.width) * W;
    setHover(nearestIndex(points.map((p) => p[0]), x));
  };

  return (
    <div className="flex items-center gap-8 border-t border-hairline px-8 py-6">
      <div className="w-[188px] shrink-0">
        <p className="text-[11px] tracking-[0.02em] text-ink-quiet">Chapter budget</p>
        <p className="mt-1 text-[17px] tabular-nums">
          {unit}
          {values[shown].toFixed(2)}
          <span className="ml-1 text-[12px] text-ink-muted">
            / {unit}
            {limit.toFixed(2)}
          </span>
        </p>
        <p className="mt-1 text-[11px] tabular-nums text-ink-muted">
          Chapter {String(shown + 1).padStart(2, '0')} · {pct}% used
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full cursor-crosshair"
        role="img"
        aria-label={`Cumulative chapter spend, ${unit}${values[values.length - 1].toFixed(2)} of a ${unit}${limit.toFixed(2)} budget`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="pl-cost-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-ink)" stopOpacity="0.1" />
            <stop offset="1" stopColor="var(--color-ink)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1={PAD} y1={budgetY} x2={W - PAD} y2={budgetY} className="stroke-hairline-strong" strokeDasharray="2 4" />
        <text x={PAD} y={budgetY - 6} textAnchor="start" fontSize={9} className="fill-ink-quiet" letterSpacing={0.8}>
          BUDGET
        </text>

        <path d={area} fill="url(#pl-cost-fill)" opacity={inView ? 1 : 0} style={{ transition: reduced ? 'none' : 'opacity 700ms' }} />
        <path
          d={line}
          fill="none"
          strokeWidth={1.8}
          pathLength={1}
          className="stroke-ink"
          strokeDasharray={1}
          strokeDashoffset={inView || reduced ? 0 : 1}
          style={{ transition: reduced ? 'none' : 'stroke-dashoffset 900ms cubic-bezier(.4,.1,.2,1)' }}
        />

        {hover !== null && <line x1={point[0]} y1={4} x2={point[0]} y2={H - PAD} className="stroke-ink" strokeOpacity={0.3} />}
        <circle cx={point[0]} cy={point[1]} r={3.4} className="fill-paper stroke-ink" strokeWidth={1.6} />
        {hover === null && !reduced && (
          <circle cx={last[0]} cy={last[1]} r={7} className="fill-ink" opacity={0.12}>
            <animate attributeName="r" values="6;9;6" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.16;0.04;0.16" dur="2.4s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
}
