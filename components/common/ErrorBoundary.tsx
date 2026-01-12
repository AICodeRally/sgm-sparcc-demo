'use client';

import { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center sparcc-hero-bg p-8">
          <div className="max-w-md w-full bg-[color:var(--color-surface)] rounded-lg shadow-xl p-8 text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-[color:var(--color-error)] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-2">Something went wrong</h1>
            <p className="text-[color:var(--color-muted)] mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] rounded p-3 text-left mb-4">
                <p className="text-xs font-mono text-[color:var(--color-error)] break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-lg hover:opacity-90 transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
