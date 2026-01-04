import { QueryClient } from '@tanstack/react-query';

import type { RepositoryComposition } from '@/adapters/repositories';

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
    },
  });
};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * リポジトリをモックに差し替えるためのオーバーライド型
 *
 * リポジトリのカテゴリと、そのカテゴリに属するリポジトリをすべてPartialにすることで、
 * リポジトリの一部をモックに差し替えることができます。
 */
export type OverrideRepositories = DeepPartial<RepositoryComposition>;

/**
 * リポジトリのオーバーライドとデフォルト値をマージする関数
 */
export function createMergedRepositories<T extends Record<string, unknown>>(
  overrideRepositories: DeepPartial<T> | undefined,
  defaultRepositories: T
): T {
  if (!overrideRepositories) {
    return defaultRepositories;
  }

  const result = { ...defaultRepositories };

  for (const key in overrideRepositories) {
    if (
      key in overrideRepositories &&
      overrideRepositories[key] !== undefined
    ) {
      const defaultValue = result[key];
      const overrideValue = overrideRepositories[key];

      if (
        typeof defaultValue === 'object' &&
        defaultValue !== null &&
        typeof overrideValue === 'object' &&
        overrideValue !== null
      ) {
        result[key] = {
          ...defaultValue,
          ...overrideValue,
        } as T[Extract<keyof T, string>];
      } else {
        result[key] = overrideValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}
