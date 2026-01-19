import '@/adapters/axios';

import { uploadFile as uploadFileApi } from '@/adapters/generated/files';
import type { FileResponse, UploadFileData } from '@/domain/models/files';

export type UploadFile = (data: UploadFileData) => Promise<FileResponse>;

/**
 * ファイルをアップロード
 * @param data アップロードデータ
 * @returns ファイルレスポンス
 */
export const uploadFile: UploadFile = async (data: UploadFileData): Promise<FileResponse> => {
  try {
    const response = await uploadFileApi({
      file: data.file,
      description: data.description,
    });

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
