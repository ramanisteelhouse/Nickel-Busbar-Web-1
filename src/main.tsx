import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { startSsrHeadCleanup } from './lib/ssrHeadCleanup';
import './index.css';

// Must run before the first render: React 19 hoists page components' head tags alongside the
// server-rendered ones rather than replacing them, leaving two canonicals on every route.
startSsrHeadCleanup();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

