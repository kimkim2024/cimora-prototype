import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { artUrl } from '../../data/art';
import { PACKS } from '../../data/studio';
import { studio, useStudio } from '../../lib/studioStore';

/** /app/market/:id — what a resource contains, its license, and the purchase. */
export default function PackPage() {
  const { id } = useParams();
  const pack = PACKS.find((item) => item.id === id);
  const { purchases, wallet } = useStudio();
  const [message, setMessage] = useState<string | null>(null);

  if (!pack) {
    return (
      <div className="py-16">
        <h1 className="text-[22px] font-medium text-ink">Resource not found</h1>
        <p className="mt-3 type-copy text-ink-muted">This resource may only exist in the prototype.</p>
        <Link to="/app/market" className="mt-6 inline-flex h-10 items-center rounded-xl border border-hairline px-4 type-copy">
          Back to the market
        </Link>
      </div>
    );
  }

  const owned = purchases.includes(pack.id);

  return (
    <>
      <Link to="/app/market" className="type-meta text-ink-quiet transition-colors hover:text-ink">
        Back to Market
      </Link>

      <header className="mt-5">
        <p className="type-micro text-ink-quiet">
          {pack.type} / {pack.category}
        </p>
        <h1 className="mt-2 text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">{pack.title}</h1>
        <p className="mt-2 max-w-[62ch] type-copy text-ink-muted">{pack.desc}</p>
        <p className="mt-2 type-micro text-ink-quiet">
          By {pack.author} · {pack.type === 'Asset pack' ? 'Asset pack v1.0' : 'Resource v1.0'} · local product example
        </p>
      </header>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_320px] items-start gap-6">
        <div>
          <div className="h-[300px] overflow-hidden rounded-2xl border border-hairline">
            <img src={artUrl(pack.art)} alt="" className="h-full w-full object-cover" />
          </div>

          <section className="mt-6 rounded-2xl border border-hairline bg-paper p-7">
            <h2 className="type-lead font-medium text-ink">What you get</h2>
            <p className="mt-2 type-copy leading-[1.75] text-ink-muted">{pack.uses}</p>

            <ol className="mt-4 grid list-none gap-3 p-0">
              {pack.steps.map((step, index) => (
                <li key={step} className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded border border-hairline type-micro tabular-nums text-ink">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="type-copy leading-[1.7] text-ink-muted">{step}</span>
                </li>
              ))}
            </ol>

            {pack.contents && (
              <>
                <h2 className="mt-7 type-lead font-medium text-ink">What is inside</h2>
                <ul className="mt-3 grid list-none gap-2 p-0">
                  {pack.contents.map((item) => (
                    <li key={item} className="relative pl-4 type-copy leading-[1.7] text-ink-muted">
                      <span className="absolute left-0 top-[9px] h-1.5 w-1.5 rounded-full bg-accent-deep" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h2 className="mt-7 type-lead font-medium text-ink">Inputs, permissions and cost</h2>
            <p className="mt-2 type-copy leading-[1.75] text-ink-muted">
              Reads only the chapter content and reference assets you choose, and outputs a candidate for your confirmation. This version runs no external code and fetches no keys.
            </p>
            <p className="mt-3 rounded-xl border border-hairline bg-paper-muted px-4 py-3 type-copy leading-[1.75] text-ink-muted">
              <strong className="font-medium text-ink">License.</strong> {pack.license}
            </p>
          </section>
        </div>

        <aside className="rounded-2xl border border-hairline bg-paper p-6">
          <p className="type-micro text-ink-quiet">Add to your library</p>
          <p className="mt-2 text-[28px] font-medium leading-none text-ink">
            {owned ? 'In your library' : pack.price ? `${pack.price} credits` : 'Free claim'}
          </p>
          <p className="mt-3 type-meta leading-[1.7] text-ink-muted">
            Resources are bought once; model calls are billed separately by usage. The prototype only simulates credits and creates no real transactions.
          </p>

          <button
            type="button"
            disabled={owned}
            onClick={() => {
              const error = studio.purchase(pack);
              setMessage(error ?? 'Added to your library; the credits ledger has recorded it.');
            }}
            className={
              'mt-5 h-10 w-full rounded-xl type-copy font-medium transition-transform ' +
              (owned
                ? 'cursor-default border border-hairline text-ink-quiet'
                : 'bg-ink text-ink-inverse shadow-key hover:-translate-y-px')
            }
          >
            {owned ? 'In library' : 'Add to my library'}
          </button>

          {message && <p className="mt-3 type-meta text-ink-muted">{message}</p>}

          <p className="mt-4 type-meta leading-[1.7] text-ink-quiet">
            When you use it, you'll see what will be added or applied; existing works aren't overwritten.
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3 type-meta">
            <span className="text-ink-quiet tabular-nums">Available · {wallet}</span>
            <Link to="/app/wallet" className="text-ink transition-colors hover:text-ink-hover">
              Credits ledger
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
