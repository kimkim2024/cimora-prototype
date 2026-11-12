import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { DevConsole } from './components/DevConsole';
import { router } from './router';
import './styles/theme.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
    <DevConsole />
  </StrictMode>,
);
