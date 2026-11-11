import { useState } from 'react';
import { FAQS, PLANS } from '../data/site';
import { Faq } from '../components/ui/Faq';
import { PageHero, Section } from '../components/ui/PageHero';
import { legacyUrl } from '../lib/legacy';

type Cycle = 'monthly' | 'yearly';

/** /pricing — plans, the usage split, and the questions people ask first. */
export default function PricingPage() {
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const [chosen, setChosen] = useState<string | null>(null);
  const yearly = cycle === 'yearly';

  return (
    <>
      <PageHero title={<>Pay for the studio, and know the cost of every generation.</>} centered className="pb-8">
        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-hairline bg-paper p-1">
          {(['monthly', 'yearly'] as Cycle[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={cycle === option}
              onClick={() => setCycle(option)}
              className={
                'h-8 rounded-full px-4 text-[13px] transition-colors ' +
                (cycle === option ? 'bg-ink text-ink-inverse' : 'text-ink-muted hover:text-ink')
              }
            >
              {option === 'monthly' ? 'Monthly' : 'Yearly · sample discount'}
            </button>
          ))}
        </div>
      </PageHero>

      <section className="container-page pt-6">
        <div className="grid grid-cols-3 gap-5">
          {PLANS.map((plan, i) => {
            const recommended = i === 1;
            return (
              <article
                key={plan.name}
                className={
                  'relative flex flex-col rounded-2xl border bg-paper p-8 ' +
                  (recommended ? 'border-ink shadow-card' : 'border-hairline')
                }
              >
                {recommended && (
                  <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-ink-on-accent">
                    Recommended for indie creators
                  </span>
                )}
                <span className="text-[11px] text-ink-quiet">{plan.name}</span>
                <h2 className="mt-2 text-[22px] font-medium leading-[1.3] tracking-[-0.02em] text-ink">{plan.tag}</h2>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-[44px] font-medium leading-none tracking-[-0.04em] tabular-nums text-ink">
                    ${yearly ? plan.yearly : plan.monthly}
                  </span>
                  <span className="text-[12px] text-ink-muted">/ mo{yearly ? ' · billed yearly (demo)' : ''}</span>
                </p>
                <p className="mt-4 min-h-[40px] text-[12px] leading-[1.7] text-ink-muted">{plan.note}</p>
                <button
                  type="button"
                  onClick={() => setChosen(plan.name)}
                  className={
                    'mt-6 inline-flex h-11 items-center justify-center rounded-xl text-[13px] font-medium transition-colors ' +
                    (recommended
                      ? 'bg-ink text-ink-inverse hover:bg-ink-hover'
                      : 'border border-hairline-strong text-ink hover:border-ink hover:bg-paper-muted')
                  }
                >
                  {i === 0 ? 'Start free trial' : `Try ${plan.name} plan`}
                </button>
                <ul className="mt-6 space-y-2.5 border-t border-hairline pt-6">
                  {plan.items.map((item) => (
                    <li key={item} className="flex gap-2 text-[12px] leading-[1.6] text-ink-muted">
                      <span aria-hidden className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-ink" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <p aria-live="polite" className="mt-5 min-h-[20px] text-[12px] text-ink-quiet">
          {chosen ? `Demo only: the ${chosen} plan is not purchased and nothing is charged.` : ''}
        </p>
      </section>

      <Section title="Subscription and model usage, clearly separate.">
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-2xl border border-hairline bg-paper p-8">
            <h3 className="text-[17px] font-medium text-ink">Workspace subscription</h3>
            <p className="mt-3 text-[13px] leading-[1.7] text-ink-muted">
              Pay for assets, editing, versions and production organization. Stable animation is not charged per
              video-model pull.
            </p>
          </div>
          <div className="rounded-2xl border border-hairline bg-paper p-8">
            <h3 className="text-[17px] font-medium text-ink">Model usage costs</h3>
            <p className="mt-3 text-[13px] leading-[1.7] text-ink-muted">
              Panel generation, voice and key-action enhancement are metered by usage. See estimates before confirming;
              new calls stop when the budget is exceeded.
            </p>
            <a
              href={legacyUrl('/app/billing')}
              className="mt-4 inline-block text-[12px] text-ink underline underline-offset-4"
            >
              View sample cost dashboard
            </a>
          </div>
        </div>
      </Section>

      <Section title="A few things to know" className="pb-24">
        <Faq items={FAQS} />
      </Section>
    </>
  );
}
