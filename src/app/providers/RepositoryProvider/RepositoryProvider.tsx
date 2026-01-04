import type { ReactNode } from 'react';

import type { RepositoryComposition } from '@/adapters/repositories';

import { RepositoryContext } from './context';

// RepositoryProviderのProps型
interface RepositoryProviderProps {
  children: ReactNode;
  repositories: RepositoryComposition;
}

/**
 * リポジトリのプロバイダー
 * アプリケーション全体でリポジトリを提供する
 */
export const RepositoryProvider = ({
  children,
  repositories,
}: RepositoryProviderProps) => {
  return <RepositoryContext value={repositories}>{children}</RepositoryContext>;
};
