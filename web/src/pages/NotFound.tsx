import { Link } from 'react-router-dom';
import { PageHero } from '../components/ui/PageHero';
import { useTitle } from '../lib/useTitle';

/** A route that does not exist at all (as opposed to one not ported yet). */
export default function NotFound() {
  useTitle('Page not found · Cimora');

  return (
    <PageHero
      title="This page has no story yet."
      lead="Go back to the product page, or keep exploring the creation tools."
      className="py-24"
    >
      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/product"
          className="inline-flex h-11 items-center rounded-xl bg-ink px-5 type-body font-medium text-ink-inverse shadow-key transition-transform hover:-translate-y-px"
        >
          Back to product
        </Link>
        <Link
          to="/tools"
          className="inline-flex h-11 items-center rounded-xl border border-hairline-strong px-5 type-body font-medium text-ink transition-colors hover:border-ink hover:bg-paper-muted"
        >
          Browse the tools
        </Link>
      </div>
    </PageHero>
  );
}
