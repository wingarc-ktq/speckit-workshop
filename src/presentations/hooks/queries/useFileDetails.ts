import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { repositoryComposition } from '@/adapters/repositories';
import type { Document } from '@/domain/models/document';

interface UseFileDetailsOptions {
  enabled?: boolean;
}

export function useFileDetails(
  documentId?: string,
  options?: UseFileDetailsOptions
): UseQueryResult<Document> {
  return useQuery<Document, Error>({
    queryKey: ['file-details', documentId],
    queryFn: async () => {
      if (!documentId) {
        throw new Error('documentId is required');
      }
      return repositoryComposition.document.getDocumentById(documentId);
    },
    enabled: Boolean(documentId) && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
