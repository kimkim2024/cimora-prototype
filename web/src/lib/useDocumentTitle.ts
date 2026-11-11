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
  '/auth': 'Enter the studio · Cimora',
};

/** Keeps document.title in step with the route, the same way the site does. */
export function useDocumentTitle(pathname: string) {
  useEffect(() => {
    const title = TITLES[pathname] ?? 'Cimora';
    if (document.title !== title) document.title = title;
  }, [pathname]);
}
