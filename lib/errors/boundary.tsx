'use client';

import React, { ReactNode } from 'react';

import { logger } from '@/lib/observability/logger';
import { reportError } from './handler';

export interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`React Error Boundary caught: ${error.message}`, error, {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    });

    reportError(error, {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      type: 'react-error-boundary'
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: '' });
  };

  render() {
    if (this.state.hasError) {
      const locale = typeof window !== 'undefined' && window.location.pathname.startsWith('/en') ? 'en' : 'it';
      const copy =
        locale === 'it'
          ? {
              eyebrow: 'Errore pagina',
              title: 'Qualcosa si è interrotto.',
              lead: 'Questa sezione non è stata caricata correttamente. Riprova o torna a Palermo.',
              retry: 'Riprova',
              back: 'Torna a Palermo'
            }
          : {
              eyebrow: 'Page error',
              title: 'Something went wrong.',
              lead: 'This section did not load correctly. Try again or go back to Palermo.',
              retry: 'Try again',
              back: 'Back to Palermo'
            };

      return (
        <main className="site-shell site-main error-shell">
          <section className="panel error-panel">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className="lead">{copy.lead}</p>
            {process.env.NODE_ENV === 'development' ? (
              <details className="error-details">
                <summary>Error details</summary>
                <pre>{this.state.error?.stack ?? this.state.error?.message}</pre>
              </details>
            ) : null}
            <div className="error-actions">
              <button type="button" className="button button-primary" onClick={this.handleReset}>
                {copy.retry}
              </button>
              <button type="button" className="button button-ghost" onClick={() => (window.location.href = `/${locale}/palermo`)}>
                {copy.back}
              </button>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
