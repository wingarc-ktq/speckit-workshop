import '@/adapters/axios';

import { createTag as createTagApi } from '@/adapters/generated/files';
import type { TagColor, TagResponse } from '@/domain/models/files';

export type CreateTagData = {
  name: string;
  color: TagColor;
};

export type CreateTag = (data: CreateTagData) => Promise<TagResponse>;

/**
 * タグを作成
 * @param data タグ作成データ
 * @returns タグレスポンス
 */
export const createTag: CreateTag = async (
  data: CreateTagData
): Promise<TagResponse> => {
  try {
    const response = await createTagApi({ name: data.name, color: data.color });

    return {
      tag: response.tag,
    };
  } catch (error) {
    // TODO: エラーハンドリング
    throw error;
  }
};
