import '@/adapters/axios';

import { getTrash as getTrashApi } from '@/adapters/generated/files';
import type { TrashListResponse } from '@/domain/models/files';

export type GetTrash = () => Promise<TrashListResponse>;

/**
 * ゴミ箱ファイル一覧を取得
 */
export const getTrash: GetTrash = async (): Promise<TrashListResponse> => {
  try {
    const response = await getTrashApi();

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
        deletedAt: file.deletedAt,
      })),
    };
  } catch (error) {
    // TODO: エラーハンドリング
    throw error;
  }
};
