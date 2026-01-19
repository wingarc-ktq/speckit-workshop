import '@/adapters/axios';

import { getTags as getTagsApi } from '@/adapters/generated/files';
import type { TagListResponse } from '@/domain/models/files';

export type GetTags = () => Promise<TagListResponse>;

/**
 * タグ一覧を取得
 * @returns タグ一覧レスポンス
 */
export const getTags: GetTags = async (): Promise<TagListResponse> => {
  try {
    const response = await getTagsApi();

    return {
      tags: response.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      })),
    };
  } catch (error) {
    // TODO: エラーハンドリング
    throw error;
  }
};
