import { customInstance } from '@/adapters/axios';
import type { FileResponse, UploadFileData } from '@/domain/models/files';

export type UploadFile = (data: UploadFileData) => Promise<FileResponse>;

/**
 * ファイルをアップロード
 * @param data アップロードデータ
 * @returns ファイルレスポンス
 */
export const uploadFile: UploadFile = async (data: UploadFileData): Promise<FileResponse> => {
  try {
    // FormDataを直接作成してtagIdsを含める
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.tagIds && data.tagIds.length > 0) {
      formData.append('tagIds', data.tagIds.join(','));
    }

    const response = await customInstance<FileResponse>({
      url: '/files',
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData,
    });

    return response;
  } catch (error) {
    // TODO: エラーハンドリング
    throw error;
  }
};
