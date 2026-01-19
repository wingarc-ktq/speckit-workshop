import '@/adapters/axios';

import { getFiles as getFilesApi } from '@/adapters/generated/files';
import type { FileListResponse, GetFilesParams } from '@/domain/models/files';

export type GetFiles = (params?: GetFilesParams) => Promise<FileListResponse>;

/**
 * ファイル一覧を取得
 * @param params 取得パラメータ
 * @returns ファイル一覧レスポンス
 */
export const getFiles: GetFiles = async (params?: GetFilesParams): Promise<FileListResponse> => {
  try {
    const response = await getFilesApi({
      search: params?.search,
      tagIds: params?.tagIds,
      page: params?.page,
      limit: params?.limit,
    });

    return {
      files: response.files.map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        description: file.description,
        uploadedAt: file.uploadedAt,
        downloadUrl: file.downloadUrl,
        tagIds: file.tagIds,
      })),
      total: response.total,
      page: response.page,
      limit: response.limit,
    };
  } catch (error) {
    // TODO: エラーハンドリング
    throw error;
  }
};
