import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppRoot } from './app/AppRoot';
import './app/styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Application root is missing.');
createRoot(root).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
);
