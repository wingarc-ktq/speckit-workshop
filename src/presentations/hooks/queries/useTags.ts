import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { repositoryComposition } from '@/adapters/repositories';
import type { Tag } from '@/domain/models/tag';

/**
 * タグ一覧取得フック
 */
export function useTags(): UseQueryResult<Tag[], Error> {
  return useQuery<Tag[], Error>({
    queryKey: ['tags'],
    queryFn: async () => repositoryComposition.tag.getTags(),
    staleTime: 1000 * 60 * 5, // 5分
    gcTime: 1000 * 60 * 10, // 10分
  });
}

/**
 * 単一タグ取得フック
 */
export function useTag(id: string): UseQueryResult<Tag, Error> {
  return useQuery<Tag, Error>({
    queryKey: ['tag', id],
    queryFn: async () => repositoryComposition.tag.getTagById(id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
