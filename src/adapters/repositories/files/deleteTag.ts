import '@/adapters/axios';

import { deleteTag as deleteTagApi } from '@/adapters/generated/files';

export type DeleteTag = (id: string) => Promise<void>;

/**
 * タグを削除
 * @param id タグID
 */
export const deleteTag: DeleteTag = async (id: string): Promise<void> => {
  try {
    await deleteTagApi(id);
  } catch (error) {
    // TODO: エラーハンドリング
    throw error;
  }
};
