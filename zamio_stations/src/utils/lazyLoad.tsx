import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingSpinner } from '@zamio/ui-theme';

interface LazyLoadOptions {
  fallback?: React.ComponentType;
  errorBoundary?: boolean;
}

/**
 * Utility function to create lazy-loaded components with consistent loading states
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunc);
  const { fallback: CustomFallback, errorBoundary = true } = options;

  const FallbackComponent = CustomFallback || (() => (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" message="Loading page..." />
    </div>
  ));

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    const content = (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );

    if (errorBoundary) {
      const { ErrorBoundary } = require('@zamio/ui-theme');
      return <ErrorBoundary>{content}</ErrorBoundary>;
    }

    return content;
  };
}

/**
 * Higher-order component for route-based lazy loading
 */
export function withLazyLoading<T extends ComponentType<any>>(
  Component: T,
  options: LazyLoadOptions = {}
): React.ComponentType<React.ComponentProps<T>> {
  const { fallback: CustomFallback } = options;

  const FallbackComponent = CustomFallback || (() => (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" message="Loading..." />
    </div>
  ));

  return function LazyWrappedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<FallbackComponent />}>
        <Component {...props} />
      </Suspense>
    );
  };
}