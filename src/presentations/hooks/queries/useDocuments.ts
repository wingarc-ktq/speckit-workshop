import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { documentRepository } from '../../adapters/repositories';
import type {
  Document,
  DocumentFilter,
  DocumentListResponse,
} from '../../domain/models/document/Document';

/**
 * useDocuments フック
 * 文書一覧を取得する TanStack Query フック
 *
 * @param filters - フィルター条件（検索、タグ ID、ページネーション）
 * @returns TanStack Query result
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDocuments({
 *   search: '請求書',
 *   tagIds: ['tag-001'],
 *   page: 1,
 *   limit: 20,
 * });
 * ```
 */
export function useDocuments(
  filters: DocumentFilter & { page?: number; limit?: number } = {}
): UseQueryResult<DocumentListResponse> {
  return useQuery<DocumentListResponse, Error>({
    queryKey: ['documents', filters],
    queryFn: async () => {
      return documentRepository.getDocuments(filters);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}

/**
 * useDocument フック
 * 特定の文書を ID で取得する
 *
 * @param id - 文書 ID
 * @returns TanStack Query result
 *
 * @example
 * ```tsx
 * const { data: document, isLoading, error } = useDocument('doc-001');
 * ```
 */
export function useDocument(id: string): UseQueryResult<Document> {
  return useQuery<Document, Error>({
    queryKey: ['document', id],
    queryFn: async () => {
      return documentRepository.getDocumentById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * useTrashDocuments フック
 * ゴミ箱内の文書一覧を取得
 *
 * @param page - ページ番号
 * @param limit - 1 ページあたりの件数
 * @returns TanStack Query result
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useTrashDocuments(1, 20);
 * ```
 */
export function useTrashDocuments(
  page: number = 1,
  limit: number = 20
): UseQueryResult<DocumentListResponse> {
  return useQuery<DocumentListResponse, Error>({
    queryKey: ['trash-documents', { page, limit }],
    queryFn: async () => {
      return documentRepository.getTrashDocuments(page, limit);
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
