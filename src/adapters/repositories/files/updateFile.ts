import '@/adapters/axios';

import { updateFile as updateFileApi } from '@/adapters/generated/files';
import type { FileResponse } from '@/domain/models/files';

export type UpdateFileData = {
  name?: string;
  description?: string;
  tagIds?: string[];
};

export type UpdateFile = (id: string, data: UpdateFileData) => Promise<FileResponse>;

/**
 * ファイル情報を更新
 * @param id ファイルID
 * @param data 更新データ
 * @returns ファイルレスポンス
 */
export const updateFile: UpdateFile = async (
  id: string,
  data: UpdateFileData
): Promise<FileResponse> => {
  try {
    const response = await updateFileApi(id, data);

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
