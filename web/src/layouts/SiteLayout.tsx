import { Link, Outlet, useLocation } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { scrollToTop } from '../lib/scroll';

/**
 * One shell for every public page: bar, page, footer. Route changes reset the
 * scroll position and swap the document title.
 */
export function SiteLayout() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);
  scrollToTop();

  return (
    <div className="flex min-h-dvh flex-col bg-canvas font-sans text-ink">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export function NotFoundLink() {
  return <Link to="/product">Back to the product page</Link>;
}
