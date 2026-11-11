import { useState } from 'react';
import { STAGES } from '../../data/product';
import { useAutoCycle, useInView, useReducedMotion } from '../../lib/hooks';
import { CostStrip } from './CostStrip';
import { LineDiagram } from './LineDiagram';

/**
 * "From creating to continuous production": one production line drawn live,
 * the three stages explained underneath, and the chapter budget underneath
 * that. Hovering either the diagram or a stage pauses the auto-cycle and pins
 * the highlight to what the pointer is on.
 */
export function ProductionLine() {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLElement>(0.12);
  const [hovered, setHovered] = useState<number | null>(null);
  const [auto] = useAutoCycle(STAGES.length, hovered !== null, reduced);
  const active = hovered ?? (reduced ? 0 : auto);

  return (
    <section ref={ref} className="container-page pb-4 pt-16" aria-labelledby="production-line-title">
      <h2
        id="production-line-title"
        className="text-[30px] wide:text-[32px] mega:text-[36px] font-medium leading-[1.25] tracking-[-0.025em] text-ink"
      >
        From creating to continuous production.
      </h2>

      <div
        className="mt-8 overflow-hidden rounded-2xl border border-hairline bg-paper shadow-card transition-[opacity,transform] duration-700"
        style={{
          opacity: inView || reduced ? 1 : 0,
          transform: inView || reduced ? 'none' : 'translateY(18px)',
        }}
      >
        <div className="px-8 pt-8">
          <LineDiagram active={active} onHover={setHovered} reduced={reduced} />
        </div>

        <div className="grid grid-cols-3 border-t border-hairline">
          {STAGES.map((stage, i) => (
            <div
              key={stage.id}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={
                'border-r border-hairline px-8 py-7 transition-colors duration-300 last:border-r-0 ' +
                (active === i ? 'bg-paper-muted' : 'bg-transparent')
              }
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] tabular-nums text-ink-quiet">{stage.no}</span>
                <h3 className="text-[17px] font-medium leading-[1.3] tracking-[-0.01em] text-ink">{stage.title}</h3>
              </div>
              <p className="mt-3 max-w-[36ch] text-[13px] leading-[1.65] text-ink-muted">{stage.description}</p>
              <a
                href={stage.href}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                className="mt-5 inline-block text-[12px] text-ink underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:decoration-current focus-visible:decoration-current"
              >
                Learn more
              </a>
            </div>
          ))}
        </div>

        <CostStrip reduced={reduced} inView={inView} />
      </div>
    </section>
  );
}
