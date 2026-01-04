import { createContext } from 'react';

import type { RepositoryComposition } from '@/adapters/repositories';

// リポジトリコンテキストの作成
export const RepositoryContext = createContext<RepositoryComposition>(
  Object.create(null) as RepositoryComposition
);
