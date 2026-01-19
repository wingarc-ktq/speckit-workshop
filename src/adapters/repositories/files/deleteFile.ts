import '@/adapters/axios';

import { deleteFile as deleteFileApi } from '@/adapters/generated/files';

export type DeleteFile = (id: string) => Promise<void>;

/**
 * ファイルをゴミ箱に移動
 * @param id ファイルID
 */
export const deleteFile: DeleteFile = async (id: string): Promise<void> => {
  try {
    await deleteFileApi(id);
  } catch (error) {
    // TODO: エラーハンドリング
    throw error;
  }
};
