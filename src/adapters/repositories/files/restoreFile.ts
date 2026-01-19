import '@/adapters/axios';

import { restoreFile as restoreFileApi } from '@/adapters/generated/files';

export type RestoreFile = (id: string) => Promise<void>;

/**
 * ゴミ箱からファイルを復元
 * @param id ファイルID
 */
export const restoreFile: RestoreFile = async (id: string): Promise<void> => {
  try {
    await restoreFileApi(id);
  } catch (error) {
    // TODO: エラーハンドリング
    throw error;
  }
};
