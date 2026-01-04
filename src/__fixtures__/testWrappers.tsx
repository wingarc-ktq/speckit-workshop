import React, { Suspense } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { repositoryComposition } from '@/adapters/repositories';
import { RepositoryProvider } from '@/app/providers/RepositoryProvider';

import {
  createTestQueryClient,
  createMergedRepositories,
  type OverrideRepositories,
} from './testUtils';

import type { QueryClient } from '@tanstack/react-query';

/**
 * RepositoryProviderのモックを作成するヘルパーコンポーネント
 */
export const RepositoryTestWrapper: React.FC<{
  override?: OverrideRepositories;
  hasSuspense?: boolean;
  queryClient?: QueryClient;
  children: React.ReactNode;
}> = ({ override, hasSuspense = false, queryClient, children }) => {
  // テスト用のqueryClientを作成（指定がない場合のみ）
  const client = queryClient ?? createTestQueryClient();

  // repositoryCompositionをベースに、必要な部分だけをオーバーライドする
  const mergedRepositories = createMergedRepositories(
    override,
    repositoryComposition
  );

  return (
    <QueryClientProvider client={client}>
      <RepositoryProvider repositories={mergedRepositories}>
        {hasSuspense ? (
          <Suspense fallback={<div data-testid="suspense">Loading...</div>}>
            {children}
          </Suspense>
        ) : (
          children
        )}
      </RepositoryProvider>
    </QueryClientProvider>
  );
};
