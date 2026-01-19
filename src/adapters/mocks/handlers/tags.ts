import { delay, http, HttpResponse } from 'msw';

import { HTTP_STATUS_SUCCESS } from '@/domain/constants';
import type { TagInfo, TagListResponse } from '@/domain/models/files';

// モックタグデータ
const MOCK_TAGS: TagInfo[] = [
  {
    id: 'tag-001',
    name: '重要',
    color: 'red',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tag-002',
    name: '学校',
    color: 'blue',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tag-003',
    name: '行事',
    color: 'green',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tag-004',
    name: 'お知らせ',
    color: 'yellow',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tag-005',
    name: '医療',
    color: 'purple',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tag-006',
    name: '請求書',
    color: 'orange',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'tag-007',
    name: '領収書',
    color: 'orange',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'tag-008',
    name: 'その他',
    color: 'gray',
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  },
];

/**
 * タグ管理APIのMSWハンドラー
 */
export const getTagsHandlers = () => {
  // タグ一覧取得
  const getTags = http.get('*/api/tags', async () => {
    await delay(500);

    const response: TagListResponse = {
      tags: MOCK_TAGS,
    };

    return HttpResponse.json(response, {
      status: HTTP_STATUS_SUCCESS.OK,
    });
  });

  return [getTags];
};
