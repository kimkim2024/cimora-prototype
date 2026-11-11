/**
 * The prototype at the repo root still owns the pages that have not been ported
 * yet, and the studio itself (`/app`). Until then, links that leave the React
 * app point at it. Override the base with VITE_LEGACY_URL when it is not on the
 * usual preview port.
 */
const BASE = (import.meta.env.VITE_LEGACY_URL as string | undefined) ?? 'http://127.0.0.1:4173';

export const legacyUrl = (path: string) => `${BASE}/#${path}`;
