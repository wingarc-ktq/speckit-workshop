import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { repositoryComposition } from '@/adapters/repositories';
import type { Document, CreateDocumentRequest } from '@/domain/models/document';

export interface FileUploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

/**
 * ファイルアップロードミューテーション
 */
export function useFileUpload(): UseMutationResult<
  Document,
  Error,
  CreateDocumentRequest,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDocumentRequest) => {
      return await repositoryComposition.document.uploadDocument(data);
    },
    onSuccess: () => {
      // ドキュメント一覧のキャッシュを無効化して、リフレッシュ
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      });
    },
  });
}
