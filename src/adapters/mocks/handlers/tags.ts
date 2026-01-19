import { delay, http, HttpResponse } from 'msw';

import { HTTP_STATUS_CLIENT_ERROR, HTTP_STATUS_SUCCESS } from '@/domain/constants';
import type { TagInfo, TagListResponse, TagResponse } from '@/domain/models/files';

// モックタグデータ（ミュータブル）
let MOCK_TAGS: TagInfo[] = [
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

  // タグ作成
  const createTag = http.post('*/api/tags', async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as { name: string; color: string };
    const { name, color } = body;

    // バリデーション
    if (!name || name.trim().length === 0) {
      return HttpResponse.json(
        { message: 'タグ名は必須です', code: 'VALIDATION_ERROR' },
        { status: HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST }
      );
    }

    if (name.length > 50) {
      return HttpResponse.json(
        { message: 'タグ名は50文字以内にしてください', code: 'VALIDATION_ERROR' },
        { status: HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST }
      );
    }

    // 重複チェック
    const isDuplicate = MOCK_TAGS.some((tag) => tag.name === name);
    if (isDuplicate) {
      return HttpResponse.json(
        { message: 'このタグ名は既に存在します', code: 'DUPLICATE_TAG' },
        { status: HTTP_STATUS_CLIENT_ERROR.CONFLICT }
      );
    }

    const now = new Date().toISOString();
    const newTag: TagInfo = {
      id: `tag-${Date.now()}`,
      name,
      color: color as TagInfo['color'],
      createdAt: now,
      updatedAt: now,
    };

    MOCK_TAGS.push(newTag);

    const response: TagResponse = { tag: newTag };
    return HttpResponse.json(response, { status: HTTP_STATUS_SUCCESS.CREATED });
  });

  // タグ更新
  const updateTag = http.put('*/api/tags/:tagId', async ({ params, request }) => {
    await delay(500);

    const { tagId } = params;
    const body = (await request.json()) as { name?: string; color?: string };

    const tagIndex = MOCK_TAGS.findIndex((tag) => tag.id === tagId);
    if (tagIndex === -1) {
      return HttpResponse.json(
        { message: 'タグが見つかりません', code: 'TAG_NOT_FOUND' },
        { status: HTTP_STATUS_CLIENT_ERROR.NOT_FOUND }
      );
    }

    const tag = MOCK_TAGS[tagIndex];

    // バリデーション
    if (body.name !== undefined) {
      if (body.name.trim().length === 0) {
        return HttpResponse.json(
          { message: 'タグ名は必須です', code: 'VALIDATION_ERROR' },
          { status: HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST }
        );
      }

      if (body.name.length > 50) {
        return HttpResponse.json(
          { message: 'タグ名は50文字以内にしてください', code: 'VALIDATION_ERROR' },
          { status: HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST }
        );
      }

      // 重複チェック（自分自身以外）
      const isDuplicate = MOCK_TAGS.some(
        (t) => t.id !== tagId && t.name === body.name
      );
      if (isDuplicate) {
        return HttpResponse.json(
          { message: 'このタグ名は既に存在します', code: 'DUPLICATE_TAG' },
          { status: HTTP_STATUS_CLIENT_ERROR.CONFLICT }
        );
      }
    }

    const updatedTag: TagInfo = {
      ...tag,
      name: body.name ?? tag.name,
      color: (body.color as TagInfo['color']) ?? tag.color,
      updatedAt: new Date().toISOString(),
    };

    MOCK_TAGS[tagIndex] = updatedTag;

    const response: TagResponse = { tag: updatedTag };
    return HttpResponse.json(response, { status: HTTP_STATUS_SUCCESS.OK });
  });

  // タグ削除
  const deleteTag = http.delete('*/api/tags/:tagId', async ({ params }) => {
    await delay(500);

    const { tagId } = params;

    const tagIndex = MOCK_TAGS.findIndex((tag) => tag.id === tagId);
    if (tagIndex === -1) {
      return HttpResponse.json(
        { message: 'タグが見つかりません', code: 'TAG_NOT_FOUND' },
        { status: HTTP_STATUS_CLIENT_ERROR.NOT_FOUND }
      );
    }

    MOCK_TAGS.splice(tagIndex, 1);

    return new HttpResponse(null, { status: HTTP_STATUS_SUCCESS.NO_CONTENT });
  });

  return [getTags, createTag, updateTag, deleteTag];
};
