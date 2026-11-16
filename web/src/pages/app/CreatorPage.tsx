import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs } from '../../components/ui/Tabs';
import { CREATOR_TABS, DRAFTS } from '../../data/studio';
import { legacyUrl } from '../../lib/legacy';
import { useStudio } from '../../lib/studioStore';

/** /app/creator — published works, asset packages and earnings in one place. */
export default function CreatorPage() {
  const { ledger } = useStudio();
  const [tab, setTab] = useState<(typeof CREATOR_TABS)[number]>('Works');
  const earned = ledger.filter((entry) => entry.delta > 0);
  const earnedTotal = earned.reduce((sum, entry) => sum + entry.delta, 0);

  return (
    <>
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[30px] font-medium leading-[1.2] tracking-[-0.025em] text-ink">Turn a method that works into the next spark of inspiration.</h1>
          <p className="mt-2 max-w-[62ch] type-copy text-ink-muted">
            Publish works and asset packages, and keep the receipts in one place. Earnings come from valid transactions; uploading a draft does not award credits.
          </p>
        </div>
        <a
          href={legacyUrl('/app/creator')}
          className="inline-flex h-10 shrink-0 items-center rounded-xl bg-ink px-4 type-copy font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
        >
          Create asset draft
        </a>
      </header>

      <div className="mt-8">
        <Tabs options={CREATOR_TABS} value={tab} onChange={setTab} label="Creator centre" />
      </div>

      {tab === 'Works' && (
        <section className="mt-6 rounded-2xl border border-hairline bg-paper p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="type-lead font-medium text-ink">Published works</h2>
            <span className="type-meta text-ink-quiet">0 works</span>
          </div>
          <p className="mt-3 max-w-[68ch] type-copy leading-[1.75] text-ink-muted">
            Nothing published yet. Open a project, pick a chapter and publish a work snapshot; the project file itself stays private.
          </p>
          <Link to="/app/projects" className="mt-4 inline-flex h-9 items-center rounded-lg border border-hairline px-3.5 type-copy transition-colors hover:bg-paper-muted">
            Open my projects
          </Link>
        </section>
      )}

      {tab === 'Asset packs' && (
        <section className="mt-6 rounded-2xl border border-hairline bg-paper p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="type-lead font-medium text-ink">Asset packages</h2>
            <span className="type-meta text-ink-quiet">
              {DRAFTS.length} {DRAFTS.length === 1 ? 'draft' : 'drafts'}
            </span>
          </div>

          <div className="mt-4">
            {DRAFTS.map((draft) => (
              <div key={draft.id} className="flex items-center justify-between gap-6 border-t border-hairline py-3.5">
                <div>
                  <strong className="block type-copy font-medium text-ink">{draft.title}</strong>
                  <p className="mt-0.5 type-meta text-ink-muted">
                    {draft.type} · {draft.price} credits · {draft.listed ? 'Listed in this local demo' : 'Draft, not listed'}
                  </p>
                </div>
                <a href={legacyUrl('/app/creator')} className="h-8 shrink-0 rounded-lg border border-hairline px-3 type-list leading-8 text-ink transition-colors hover:bg-paper-muted">
                  {draft.listed ? 'View page' : 'Preview and list'}
                </a>
              </div>
            ))}
          </div>

          <p className="mt-4 type-meta leading-[1.7] text-ink-quiet">
            A listing needs contents, usage scope and license. The draft and listing dialogs are still in the prototype; this page covers the overview.
          </p>
        </section>
      )}

      {tab === 'Earnings' && (
        <section className="mt-6 rounded-2xl border border-hairline bg-paper p-7">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-hairline bg-paper p-6">
              <p className="type-micro text-ink-quiet">Credits earned</p>
              <p className="mt-3 text-[40px] font-medium leading-none tabular-nums text-ink">✦ {earnedTotal}</p>
              <p className="mt-2 type-meta text-ink-quiet">Local demo balance · no payout</p>
            </div>
            <div className="rounded-xl border border-hairline bg-paper p-6">
              <p className="type-micro text-ink-quiet">Sales recorded</p>
              <p className="mt-3 text-[40px] font-medium leading-none tabular-nums text-ink">
                {earned.length}
                <span className="ml-1 text-[14px] font-normal text-ink-quiet">entries</span>
              </p>
              <p className="mt-2 type-meta text-ink-quiet">Valid transactions only</p>
            </div>
          </div>

          {earned.length === 0 ? (
            <p className="mt-5 type-copy text-ink-muted">
              No earnings recorded yet. Earnings come from valid transactions, not from uploading a draft.
            </p>
          ) : (
            <div className="mt-5">
              {earned.map((entry) => (
                <div key={entry.id} className="flex items-center gap-6 border-b border-hairline py-3 type-copy">
                  <span className="text-ink">{entry.title}</span>
                  <small className="ml-auto type-micro text-ink-quiet">{new Date(entry.time).toLocaleDateString('en-GB')}</small>
                  <b className="tabular-nums font-normal text-ink">+{entry.delta}</b>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 type-meta text-ink-quiet">All amounts here are simulated; no real payment or payout happens in this prototype.</p>
        </section>
      )}
    </>
  );
}
