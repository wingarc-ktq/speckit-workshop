import '@/adapters/axios';

import { permanentlyDeleteFile as permanentlyDeleteFileApi } from '@/adapters/generated/files';

export type PermanentlyDeleteFile = (id: string) => Promise<void>;

/**
 * ファイルを完全削除
 * @param id ファイルID
 */
export const permanentlyDeleteFile: PermanentlyDeleteFile = async (
  id: string
): Promise<void> => {
  try {
    await permanentlyDeleteFileApi(id);
  } catch (error) {
    // TODO: エラーハンドリング
    throw error;
  }
};
