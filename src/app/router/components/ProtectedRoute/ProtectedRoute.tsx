import React, { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { AuthErrorFallback, AuthChecker } from './components';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 * @remarks useSuspenseQueryを使用しているため、SuspenseとError Boundaryで包む必要がある
 * ローディングはQueryProviderのLoadingControllerで行われるため、Suspenseのfallbackは指定しない
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={AuthErrorFallback}>
      <Suspense>
        <AuthChecker>{children}</AuthChecker>
      </Suspense>
    </ErrorBoundary>
  );
};
