import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { HomeFooter } from '../components/HomeFooter';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { scrollToTop, useWheelScrollFallback } from '../lib/scroll';

/**
 * One shell for every public page: bar, page, footer. The home page carries its
 * own footer (the dotted band one), everything else shares the standard one.
 */
export function SiteLayout() {
  const { pathname } = useLocation();
  const home = pathname === '/';
  useDocumentTitle(pathname);

  // reset the scroll after the route renders, never during render
  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  // and keep the wheel working even if the browser drops it
  useWheelScrollFallback();

  return (
    <div className="flex min-h-dvh flex-col bg-canvas font-sans text-ink">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      {home ? <HomeFooter /> : <SiteFooter />}
    </div>
  );
}

export function NotFoundLink() {
  return <Link to="/product">Back to the product page</Link>;
}
