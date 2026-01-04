import React, { useMemo } from 'react';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';

import { GLOBAL_LOADING } from '@/presentations/hooks/queries/constants';
import { LoadingOverlay } from '@/presentations/ui';

interface LoadingControllerProps {
  children: React.ReactNode;
}

/**
 * グローバルでローディング状態を監視し、ローディングオーバーレイを表示するコンポーネント
 * @remarks
 * - useIsFetching と useIsMutating を使用して、アプリケーション全体のローディング状態を監視
 * - ローディング中は {@link LoadingOverlay} を表示し、ユーザーに処理中であることを通知
 * - children は常に表示されるため、ローディング中も他のコンテンツは維持される
 */
export const LoadingController: React.FC<LoadingControllerProps> = ({
  children,
}) => {
  const isFetching = useIsFetching({ queryKey: [GLOBAL_LOADING] }); //Suspenseとかぶるが許容

  const isMutating = useIsMutating();

  const showLoading = useMemo(
    () => isFetching > 0 || isMutating > 0,
    [isFetching, isMutating]
  );

  return (
    <>
      {children}
      <LoadingOverlay open={showLoading} />
    </>
  );
};
