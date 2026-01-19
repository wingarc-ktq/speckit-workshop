import '@/adapters/axios';

import { getFileById as getFileApi } from '@/adapters/generated/files';
import type { FileResponse } from '@/domain/models/files';

export type GetFile = (id: string) => Promise<FileResponse>;

/**
 * 個別ファイルを取得
 * @param id ファイルID
 * @returns ファイルレスポンス
 */
export const getFile: GetFile = async (id: string): Promise<FileResponse> => {
  try {
    const response = await getFileApi(id);

    return {
      file: {
        id: response.file.id,
        name: response.file.name,
        size: response.file.size,
        mimeType: response.file.mimeType,
        description: response.file.description,
        uploadedAt: response.file.uploadedAt,
        downloadUrl: response.file.downloadUrl,
        tagIds: response.file.tagIds,
      },
    };
  } catch (error) {
    // TODO: エラーハンドリング
    throw error;
  }
};
