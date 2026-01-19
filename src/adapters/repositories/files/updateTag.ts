import '@/adapters/axios';

import { updateTag as updateTagApi } from '@/adapters/generated/files';
import type { TagResponse } from '@/domain/models/files';

export type UpdateTagData = {
  name?: string;
  color?: string;
};

export type UpdateTag = (id: string, data: UpdateTagData) => Promise<TagResponse>;

/**
 * タグを更新
 * @param id タグID
 * @param data タグ更新データ
 * @returns タグレスポンス
 */
export const updateTag: UpdateTag = async (
  id: string,
  data: UpdateTagData
): Promise<TagResponse> => {
  try {
    const response = await updateTagApi(id, data);

    return {
      tag: response.tag,
    };
  } catch (error) {
    // TODO: エラーハンドリング
    throw error;
  }
};
