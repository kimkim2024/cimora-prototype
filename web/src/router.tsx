import { createHashRouter, Navigate } from 'react-router-dom';
import { SiteLayout } from './layouts/SiteLayout';
import NotPorted from './pages/NotPorted';
import ProductPage from './pages/ProductPage';

/**
 * Hash routing, on purpose: every existing link in the prototype and in the
 * marketing copy is written as `#/path`, so the new app inherits the URL scheme
 * instead of breaking it. Routes are added here as pages are ported; anything
 * unknown falls through to NotPorted, which links back to the prototype.
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      { index: true, element: <Navigate to="/product" replace /> },
      { path: 'product', element: <ProductPage /> },
      { path: '*', element: <NotPorted /> },
    ],
  },
]);
