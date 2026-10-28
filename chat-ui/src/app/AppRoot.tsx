import { lazy, Suspense } from 'react';

import { ErrorBoundary } from '../shared/components/ErrorBoundary';

const App = lazy(() => import('./App').then(({ App }) => ({ default: App })));

export function AppRoot() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div
            role="status"
            className="flex min-h-dvh items-center justify-center"
          >
            Loading chat…
          </div>
        }
      >
        <App />
      </Suspense>
    </ErrorBoundary>
  );
}
