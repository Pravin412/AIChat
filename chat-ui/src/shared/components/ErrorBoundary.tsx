import { Component } from 'react';

import { Button } from './Button';

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-dvh items-center justify-center p-6">
          <section
            role="alert"
            className="max-w-md rounded-xl border border-border bg-surface p-6 text-center shadow-soft"
          >
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-3 text-text-muted">
              We couldn’t load the chat. Reload the page to try again. Your
              current conversation may be lost.
            </p>
            <Button
              variant="primary"
              className="mt-5"
              onClick={() => window.location.reload()}
            >
              Reload page
            </Button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
