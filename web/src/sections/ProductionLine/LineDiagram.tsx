import { STAGES } from '../../data/product';

const VB_W = 1160;
const VB_H = 228;

const NODE_Y = 44;
const NODE_H = 140;
const NODE_W = 190;
const NODE_X = [252, 506, 760];
const LINK_Y = NODE_Y + NODE_H / 2;

const IN = { x: 20, y: 52, w: 172, h: 116 };
const OUT = { x: 1014, y: 76, w: 122, h: 76 };

const LINKS = [
  { x1: IN.x + IN.w, x2: NODE_X[0], dashed: false },
  { x1: NODE_X[0] + NODE_W, x2: NODE_X[1], dashed: true },
  { x1: NODE_X[1] + NODE_W, x2: NODE_X[2], dashed: true },
  { x1: NODE_X[2] + NODE_W, x2: OUT.x, dashed: false },
];

type Props = {
  active: number;
  onHover: (index: number | null) => void;
  reduced: boolean;
};

/** The three stages drawn as one production line: story in, delivered work out. */
export function LineDiagram({ active, onHover, reduced }: Props) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="w-full"
      role="img"
      aria-label="One story moving through comic panels, a motion shot and the studio workflow, then out as delivered work"
    >
      <defs>
        <linearGradient id="pl-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* accent wash behind the active stage */}
      <rect
        x={NODE_X[active] - 22}
        y={NODE_Y - 22}
        width={NODE_W + 44}
        height={NODE_H + 44}
        rx={20}
        fill="url(#pl-glow)"
      />

      {/* story in */}
      <g>
        <rect x={IN.x + 12} y={IN.y + 12} width={IN.w} height={IN.h} rx={10} className="fill-paper stroke-hairline" />
        <rect x={IN.x + 6} y={IN.y + 6} width={IN.w} height={IN.h} rx={10} className="fill-paper stroke-hairline" />
        <rect x={IN.x} y={IN.y} width={IN.w} height={IN.h} rx={10} className="fill-paper stroke-hairline-strong" />
        <text x={IN.x + 14} y={IN.y + 22} className="fill-ink-quiet" fontSize={9} letterSpacing={1.4}>
          CHAPTER 01
        </text>
        <rect x={IN.x + 14} y={IN.y + 32} width={92} height={7} rx={3.5} className="fill-ink" opacity={0.85} />
        <rect x={IN.x + 14} y={IN.y + 50} width={132} height={4} rx={2} className="fill-hairline" />
        <rect x={IN.x + 14} y={IN.y + 60} width={112} height={4} rx={2} className="fill-hairline" />
        <rect x={IN.x + 14} y={IN.y + 80} width={66} height={18} rx={9} className="fill-paper-muted stroke-hairline" />
        <text x={IN.x + 47} y={IN.y + 93} textAnchor="middle" className="fill-ink-muted" fontSize={9}>
          Story draft
        </text>
      </g>

      {/* connectors */}
      {LINKS.map((link, i) => {
        const on = i === active + 1 || i === active;
        return (
          <g key={i}>
            <line
              x1={link.x1}
              y1={LINK_Y}
              x2={link.x2}
              y2={LINK_Y}
              strokeWidth={1.2}
              strokeDasharray={link.dashed ? '3 4' : undefined}
              className={on ? 'stroke-ink' : 'stroke-hairline-strong'}
              style={{ transition: 'stroke 300ms' }}
            />
            {!reduced && (
              <circle r={2.4} className="fill-ink">
                <animateMotion
                  dur={`${2.1 + (i % 2) * 0.6}s`}
                  begin={`${i * 0.32}s`}
                  repeatCount="indefinite"
                  path={`M${link.x1},${LINK_Y} H${link.x2}`}
                />
              </circle>
            )}
          </g>
        );
      })}

      {/* the three stages */}
      {STAGES.map((stage, i) => {
        const x = NODE_X[i];
        const on = active === i;
        return (
          <g key={stage.id} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)}>
            <rect
              x={x}
              y={NODE_Y}
              width={NODE_W}
              height={NODE_H}
              rx={12}
              strokeWidth={on ? 1.6 : 1}
              className={on ? 'fill-paper stroke-ink' : 'fill-paper stroke-hairline-strong'}
              style={{ transition: 'stroke 300ms' }}
            />
            <text x={x + 16} y={NODE_Y + 22} className="fill-ink-quiet" fontSize={9} letterSpacing={1.2}>
              {stage.no}
            </text>

            {i === 0 && <ComicPanels x={x} />}
            {i === 1 && <MotionStrip x={x} on={on} reduced={reduced} />}
            {i === 2 && <StudioRows x={x} on={on} />}

            <text
              x={x + NODE_W / 2}
              y={NODE_Y + NODE_H - 14}
              textAnchor="middle"
              fontSize={10}
              className={on ? 'fill-ink' : 'fill-ink-muted'}
              style={{ transition: 'fill 300ms' }}
            >
              {on ? stage.stat : stage.title}
            </text>
          </g>
        );
      })}

      {/* delivered work */}
      <g>
        <rect x={OUT.x} y={OUT.y} width={OUT.w} height={OUT.h} rx={10} className="fill-paper stroke-hairline-strong" />
        <circle cx={OUT.x + 26} cy={OUT.y + 26} r={9} className="fill-accent" />
        <path
          d={`M${OUT.x + 22} ${OUT.y + 26} l3 3 6-6`}
          fill="none"
          strokeWidth={1.6}
          className="stroke-ink-on-accent"
          strokeLinecap="round"
        />
        <text x={OUT.x + 44} y={OUT.y + 30} className="fill-ink" fontSize={11}>
          Delivered
        </text>
        <text x={OUT.x + 14} y={OUT.y + 56} className="fill-ink-quiet" fontSize={9} letterSpacing={0.6}>
          PNG · MP4 · v2
        </text>
      </g>
    </svg>
  );
}

function ComicPanels({ x }: { x: number }) {
  const cells = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ];
  return (
    <g>
      {cells.map(([cx, cy], i) => (
        <rect
          key={i}
          x={x + 22 + cx * 77}
          y={NODE_Y + 32 + cy * 38}
          width={69}
          height={30}
          rx={4}
          strokeWidth={1}
          className={i < 3 ? 'fill-paper-sunken stroke-hairline-strong' : 'fill-paper stroke-hairline'}
        />
      ))}
      <line x1={x + 30} y1={NODE_Y + 40} x2={x + 78} y2={NODE_Y + 40} className="stroke-hairline-strong" strokeWidth={2} />
      <line x1={x + 30} y1={NODE_Y + 49} x2={x + 64} y2={NODE_Y + 49} className="stroke-hairline" strokeWidth={2} />
    </g>
  );
}

function MotionStrip({ x, on, reduced }: { x: number; on: boolean; reduced: boolean }) {
  const frames = [0, 1, 2, 3, 4];
  return (
    <g>
      {frames.map((f) => (
        <rect
          key={f}
          x={x + 22 + f * 30}
          y={NODE_Y + 36}
          width={26}
          height={40}
          rx={3}
          strokeWidth={1}
          className={on ? 'fill-paper-sunken stroke-hairline-strong' : 'fill-paper stroke-hairline'}
          style={{ transition: 'fill 300ms' }}
        />
      ))}
      <line
        x1={x + 22}
        y1={NODE_Y + 30}
        x2={x + 22}
        y2={NODE_Y + 82}
        className="stroke-ink"
        strokeWidth={1.4}
        opacity={on ? 1 : 0.3}
      >
        {!reduced && on && (
          <animate attributeName="x1" values={`${x + 22};${x + 168};${x + 22}`} dur="3.4s" repeatCount="indefinite" />
        )}
        {!reduced && on && (
          <animate attributeName="x2" values={`${x + 22};${x + 168};${x + 22}`} dur="3.4s" repeatCount="indefinite" />
        )}
      </line>
      <path d={`M${x + 22} ${NODE_Y + 88} H${x + 168}`} className="stroke-hairline" strokeWidth={2} strokeDasharray="2 3" />
    </g>
  );
}

function StudioRows({ x, on }: { x: number; on: boolean }) {
  return (
    <g>
      {[0, 1, 2].map((r) => {
        const y = NODE_Y + 32 + r * 26;
        const done = r === 2;
        return (
          <g key={r}>
            <rect
              x={x + 22}
              y={y}
              width={146}
              height={18}
              rx={5}
              strokeWidth={1}
              className={done && on ? 'fill-accent stroke-hairline-strong' : 'fill-paper-sunken stroke-hairline'}
              style={{ transition: 'fill 300ms' }}
            />
            <circle cx={x + 32} cy={y + 9} r={3} className="fill-ink-quiet" />
            <rect x={x + 42} y={y + 7} width={done ? 74 : 56 + r * 12} height={4} rx={2} className="fill-hairline-strong" />
            {done && (
              <path d={`M${x + 150} ${y + 9} l3 3 5-6`} fill="none" strokeWidth={1.5} className="stroke-ink" strokeLinecap="round" />
            )}
          </g>
        );
      })}
    </g>
  );
}
