import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { artUrl } from '../../data/art';
import { PACKS, type Pack } from '../../data/studio';
import { useStudio } from '../../lib/studioStore';

const FILTERS = ['All', 'Skill', 'Template', 'Workflow', 'Asset pack', 'Owned'] as const;
type Filter = (typeof FILTERS)[number];

const typeLabel = (pack: Pack) => (pack.type === 'Asset pack' ? 'ASSET PACK' : pack.type.toUpperCase());

/** /app/market — resources and asset packs, bought once with credits. */
export default function MarketPage() {
  const { wallet, purchases } = useStudio();
  const [filter, setFilter] = useState<Filter>('All');

  const packs = useMemo(() => {
    if (filter === 'Owned') return PACKS.filter((pack) => purchases.includes(pack.id));
    if (filter === 'All') return PACKS;
    return PACKS.filter((pack) => pack.type === filter);
  }, [filter, purchases]);

  return (
    <>
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[30px] font-medium leading-[1.2] tracking-[-0.025em] text-ink">Help good methods get seen by more people.</h1>
          <p className="mt-2 max-w-[62ch] type-copy text-ink-muted">
            Explore skills, templates, workflows and asset packs. Resources are bought once with credits; model calls are billed separately by usage.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link to="/app/creator" className="inline-flex h-10 items-center rounded-xl border border-hairline px-4 type-copy transition-colors hover:bg-paper-muted">
            Become a creator
          </Link>
          <Link to="/app/wallet" className="inline-flex h-10 items-center gap-2 rounded-xl border border-hairline bg-paper-muted px-4 type-copy tabular-nums">
            <span className="text-accent-deep">✦</span>
            {wallet} credits
          </Link>
        </div>
      </header>

      <div role="group" aria-label="Filter resources" className="mt-8 flex flex-wrap items-center gap-2">
        {FILTERS.map((option) => {
          const active = option === filter;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(option)}
              className={
                'h-8 rounded-full border px-3.5 type-list transition-colors ' +
                (active
                  ? 'border-ink bg-ink text-ink-inverse'
                  : 'border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink')
              }
            >
              {option}
            </button>
          );
        })}
      </div>

      {packs.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-hairline px-5 py-9 type-copy text-ink-muted">
          Nothing in this view yet. Your library starts empty, and the starter recipes are free.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-x-6 gap-y-8">
          {packs.map((pack) => {
            const owned = purchases.includes(pack.id);
            return (
              <Link key={pack.id} to={`/app/market/${pack.id}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-hairline bg-paper-muted">
                  <img
                    src={artUrl(pack.art)}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-3 left-3 rounded bg-ink/80 px-2 py-1 type-micro text-ink-inverse">
                    {pack.type}
                  </span>
                </div>
                <p className="mt-3 type-micro text-ink-quiet">
                  {pack.category} / by {pack.author}
                </p>
                <h3 className="mt-1 type-body font-medium text-ink">{pack.title}</h3>
                <p className="mt-1 type-meta leading-[1.6] text-ink-muted">{pack.desc}</p>
                <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2 type-micro text-ink-quiet">
                  <span className={owned ? 'text-ink' : undefined}>
                    {owned ? 'In library' : pack.price ? `${pack.price} credits` : 'Free'}
                  </span>
                  <span>{typeLabel(pack)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
