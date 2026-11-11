import { useEffect } from 'react';

const TITLES: Record<string, string> = {
  '/': 'Cimora · Product',
  '/product': 'All-in-one studio · Cimora',
  '/pricing': 'Pricing & usage · Cimora',
  '/tools': 'Tools hub · Cimora',
  '/showcase': 'Showcase · Cimora',
  '/templates': 'Templates · Cimora',
  '/resources': 'Guides · Cimora',
  '/help': 'Help center · Cimora',
};

/**
 * Keeps document.title in step with the route. Only static routes are handled
 * here; pages with dynamic content (a case, a guide, a policy) set their own
 * title, and this leaves it alone.
 */
export function useDocumentTitle(pathname: string) {
  useEffect(() => {
    const title = TITLES[pathname];
    if (title && document.title !== title) document.title = title;
  }, [pathname]);
}
