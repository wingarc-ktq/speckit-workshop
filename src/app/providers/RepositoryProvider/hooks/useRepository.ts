import { useContext } from 'react';

import type { RepositoryComposition } from '@/adapters/repositories';

import { RepositoryContext } from '../context';

/**
 * リポジトリを取得するカスタムフック
 * @returns リポジトリの構成オブジェクト
 */
export const useRepository = (): RepositoryComposition =>
  useContext(RepositoryContext);
