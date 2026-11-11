import { MODES } from '../data/product';

/** Quick mode vs studio mode: two ways in, one destination. */
export function ModeComparison() {
  return (
    <section className="container-page pt-14" aria-label="Two ways to start">
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-hairline bg-paper">
        {MODES.map((mode, i) => (
          <div key={mode.id} className={'px-10 py-9 ' + (i === 0 ? 'border-r border-hairline' : '')}>
            <h3 className="text-[22px] font-medium leading-[1.3] tracking-[-0.02em] text-ink">{mode.title}</h3>
            <p className="mt-3 max-w-[46ch] text-[13px] leading-[1.7] text-ink-muted">{mode.body}</p>
            <a
              href={mode.href}
              className={
                'mt-6 inline-flex h-10 items-center rounded-xl px-4 text-[13px] font-medium transition-colors ' +
                (mode.primary
                  ? 'bg-ink text-ink-inverse hover:bg-ink-hover'
                  : 'border border-hairline-strong text-ink hover:border-ink hover:bg-paper-muted')
              }
            >
              {mode.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
