import React from 'react';

import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

import { CrashPage } from '@/presentations/pages/CrashPage';

/**
 * React Routerのエラーを捕捉してCrashPageに渡すコンポーネント
 */
export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();

  // エラーを適切なErrorインスタンスに変換
  const normalizedError = (() => {
    if (isRouteErrorResponse(error)) {
      return new Error(`${error.status} ${error.statusText}`);
    }

    if (error instanceof Error) return error;

    return new Error(String(error));
  })();

  const handleReset = () => {
    window.location.reload();
  };

  return <CrashPage error={normalizedError} resetErrorBoundary={handleReset} />;
};
