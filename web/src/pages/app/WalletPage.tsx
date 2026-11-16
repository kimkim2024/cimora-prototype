import { Link } from 'react-router-dom';
import { artUrl } from '../../data/art';
import { PACKS } from '../../data/studio';
import { studio, useStudio } from '../../lib/studioStore';

/** /app/wallet — balance, library and the credits ledger. */
export default function WalletPage() {
  const { wallet, purchases, ledger } = useStudio();
  const owned = PACKS.filter((pack) => purchases.includes(pack.id));

  return (
    <>
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[30px] font-medium leading-[1.2] tracking-[-0.025em] text-ink">Credits and resources</h1>
          <p className="mt-2 max-w-[62ch] type-copy text-ink-muted">
            Purchases, claims and creator earnings are recorded separately. Credits are a local demo only.
          </p>
        </div>
        <Link
          to="/app/market"
          className="inline-flex h-10 shrink-0 items-center rounded-xl bg-ink px-4 type-copy font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
        >
          Discover new assets
        </Link>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <section className="rounded-2xl border border-hairline bg-paper p-7">
          <p className="type-micro text-ink-quiet">Available credits</p>
          <p className="mt-3 text-[40px] font-medium leading-none tabular-nums text-ink">✦ {wallet}</p>
          <p className="mt-3 type-meta text-ink-quiet">Local sample balance · no withdrawal · no real payment</p>
          <button
            type="button"
            onClick={() => studio.topUp(200)}
            className="mt-4 h-9 rounded-lg border border-hairline px-3.5 type-copy transition-colors hover:bg-paper-muted"
          >
            Add 200 demo credits
          </button>
        </section>
        <section className="rounded-2xl border border-hairline bg-paper p-7">
          <p className="type-micro text-ink-quiet">My library</p>
          <p className="mt-3 text-[40px] font-medium leading-none tabular-nums text-ink">
            {purchases.length}
            <span className="ml-1 text-[14px] font-normal text-ink-quiet">items</span>
          </p>
          <p className="mt-3 type-meta text-ink-quiet">Skills, templates, workflows and asset packs</p>
        </section>
      </div>

      {owned.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-x-6 gap-y-8">
          {owned.map((pack) => (
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
              <div className="mt-2 flex items-center justify-between border-t border-hairline pt-2 type-micro text-ink-quiet">
                <span className="text-ink">In library</span>
                <span>{pack.type === 'Asset pack' ? 'ASSET PACK' : pack.type.toUpperCase()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-hairline bg-paper p-7">
        <h2 className="type-lead font-medium text-ink">Credits ledger</h2>
        {ledger.length === 0 ? (
          <p className="mt-3 type-copy text-ink-muted">No credit changes yet. The starting demo balance is 680 credits.</p>
        ) : (
          <div className="mt-3">
            {ledger.map((entry) => (
              <div key={entry.id} className="flex items-center gap-6 border-b border-hairline py-3 type-copy">
                <span className="text-ink">{entry.title}</span>
                <small className="ml-auto type-micro text-ink-quiet">{new Date(entry.time).toLocaleDateString('en-GB')}</small>
                <b className="tabular-nums font-normal text-ink">
                  {entry.delta > 0 ? '+' : ''}
                  {entry.delta}
                </b>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 type-micro text-ink-quiet">
          Model run budgets are shown separately in USD examples and are not deducted from this balance.
        </p>
      </section>
    </>
  );
}
