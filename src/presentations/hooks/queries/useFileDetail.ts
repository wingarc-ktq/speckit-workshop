import { useQuery } from '@tanstack/react-query';
import { useRepository } from '@/app/providers/RepositoryProvider';
import type { FileInfo } from '@/adapters/generated/files';

/**
 * 個別ファイルの詳細情報を取得するフック
 * @param fileId - ファイルID
 * @param enabled - クエリを有効にするかどうか（デフォルト: true）
 */
export const useFileDetail = (fileId: string | undefined, enabled = true) => {
  const repositories = useRepository();

  return useQuery<FileInfo>({
    queryKey: ['file', fileId] as const,
    queryFn: async () => {
      if (!fileId) {
        throw new Error('File ID is required');
      }
      console.log('Fetching file detail for ID:', fileId);
      const response = await repositories.files.getFile(fileId);
      console.log('File detail response:', response);
      return response.file;
    },
    enabled: enabled && !!fileId,
    staleTime: 1000 * 60 * 10, // 10分間はキャッシュを使用
    gcTime: 1000 * 60 * 15, // 15分間はガベージコレクション対象外
  });
};
