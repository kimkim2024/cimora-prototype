import { Link, useLocation } from 'react-router-dom';
import { legacyUrl } from '../lib/legacy';
import { useTitle } from '../lib/useTitle';

/**
 * Placeholder for a route that has not been ported yet. It says so plainly and
 * hands the visitor over to the prototype, which still has the page.
 */
export default function NotPorted() {
  const { pathname } = useLocation();
  useTitle('Not ported yet · Cimora');

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-col items-start px-10 py-24">
      <p className="text-[12px] tracking-[0.02em] text-ink-quiet">Not ported yet</p>
      <h1 className="mt-4 max-w-[24ch] text-[36px] font-medium leading-[1.15] tracking-[-0.03em] text-ink">
        <code className="text-[32px] text-ink-muted">{pathname}</code> still lives in the prototype.
      </h1>
      <p className="mt-4 max-w-[58ch] text-[14px] leading-[1.7] text-ink-muted">
        The React app currently covers the product page only. Every other route is being moved over one page at a time;
        in the meantime the same URL works in the original prototype.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <a
          href={legacyUrl(pathname)}
          className="inline-flex h-11 items-center rounded-xl bg-ink px-5 text-[14px] font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
        >
          Open it in the prototype
        </a>
        <Link
          to="/product"
          className="inline-flex h-11 items-center rounded-xl border border-hairline-strong px-5 text-[14px] font-medium text-ink transition-colors hover:border-ink hover:bg-paper-muted"
        >
          Back to the product page
        </Link>
      </div>
    </section>
  );
}
