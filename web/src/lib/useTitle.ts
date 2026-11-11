import { useEffect } from 'react';

/** Page-owned document title. The layout only sets titles for static routes. */
export function useTitle(title: string) {
  useEffect(() => {
    if (document.title !== title) document.title = title;
  }, [title]);
}
