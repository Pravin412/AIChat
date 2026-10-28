import { render, screen } from '@testing-library/react';
import { lazy, Suspense } from 'react';
import { expect, it } from 'vitest';

import { ErrorBoundary } from '../shared/components/ErrorBoundary';

it('renders its children when there is no error', () => {
  render(
    <ErrorBoundary>
      <p>Chat is ready</p>
    </ErrorBoundary>,
  );
  expect(screen.getByText('Chat is ready')).toBeInTheDocument();
});

it('shows a recovery screen when rendering fails', () => {
  function BrokenChat(): never {
    throw new Error('Rendering failed');
  }
  render(
    <ErrorBoundary>
      <BrokenChat />
    </ErrorBoundary>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  expect(
    screen.getByRole('button', { name: 'Reload page' }),
  ).toBeInTheDocument();
});

it('shows the recovery screen when app initialization fails', async () => {
  const BrokenApp = lazy(() => Promise.reject(new Error('Startup failed')));
  render(
    <ErrorBoundary>
      <Suspense fallback={<p>Loading</p>}>
        <BrokenApp />
      </Suspense>
    </ErrorBoundary>,
  );
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Something went wrong',
  );
});
