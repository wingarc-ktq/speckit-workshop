import React from 'react';

import { useGetCurrentSessionQuery } from '@/presentations/hooks/queries';

interface AuthCheckerProps {
  children: React.ReactNode;
}

/**
 * 認証状態をチェックする内部コンポーネント
 */
export const AuthChecker: React.FC<AuthCheckerProps> = ({ children }) => {
  // セッションが存在しない場合は SpaException をスロー
  useGetCurrentSessionQuery();

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>;
};
