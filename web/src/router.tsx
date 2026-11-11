import { createHashRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { SiteLayout } from './layouts/SiteLayout';
import { ArticlePage, CasePage, TemplatePage, UpdatesPage } from './pages/DetailPages';
import FeaturesPage from './pages/FeaturesPage';
import { HelpPage, LegalPage, ToolsPage } from './pages/InfoPages';
import { ResourcesPage, ShowcasePage, TemplatesPage } from './pages/CatalogPages';
import NotPorted from './pages/NotPorted';
import NotFound from './pages/NotFound';
import PricingPage from './pages/PricingPage';
import ProductPage from './pages/ProductPage';
import ProjectsPage from './pages/app/ProjectsPage';

/**
 * Hash routing, on purpose: every existing link in the prototype and in the
 * marketing copy is written as `#/path`, so the new app inherits the URL scheme
 * instead of breaking it. The studio has its own shell; whatever is still only
 * in the prototype falls through to NotPorted.
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      { index: true, element: <Navigate to="/product" replace /> },

      { path: 'product', element: <ProductPage /> },
      { path: 'features/:id', element: <FeaturesPage /> },

      { path: 'showcase', element: <ShowcasePage /> },
      { path: 'showcase/:id', element: <CasePage /> },

      { path: 'templates', element: <TemplatesPage /> },
      { path: 'templates/:id', element: <TemplatePage /> },

      { path: 'resources', element: <ResourcesPage /> },
      { path: 'resources/updates', element: <UpdatesPage /> },
      { path: 'resources/:id', element: <ArticlePage /> },

      { path: 'pricing', element: <PricingPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: 'tools', element: <ToolsPage /> },
      { path: 'legal/:doc', element: <LegalPage /> },

      { path: 'auth', element: <NotPorted /> },
      { path: 'tools/:id', element: <NotPorted /> },
      { path: 'share/*', element: <NotPorted /> },

      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/app/projects" replace /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: '*', element: <NotPorted /> },
    ],
  },
]);
