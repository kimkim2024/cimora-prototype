import { Link } from 'react-router-dom';
import { legacyUrl } from '../lib/legacy';

/** Closing call to action: one story, one next step. */
export function ClosingCta() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-10 py-24">
      <div className="flex flex-col items-center rounded-2xl border border-hairline bg-paper px-10 py-20 text-center shadow-card">
        <h2 className="max-w-[26ch] text-[36px] font-medium leading-[1.15] tracking-[-0.03em] text-ink">
          What happens in the next panel?
        </h2>
        <p className="mt-4 text-[14px] text-ink-muted">Bring your characters and story. Start here.</p>
        <div className="mt-8 flex items-center gap-3">
          <a
            href={legacyUrl('/app/new')}
            className="inline-flex h-11 items-center rounded-xl bg-ink px-6 text-[14px] font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
          >
            Start a new story
          </a>
          <Link
            to="/tools"
            className="inline-flex h-11 items-center rounded-xl border border-hairline-strong px-6 text-[14px] font-medium text-ink transition-colors hover:border-ink hover:bg-paper-muted"
          >
            Try free tools first
          </Link>
        </div>
      </div>
    </section>
  );
}
