import { delay, http, HttpResponse } from 'msw';

import { HTTP_STATUS_CLIENT_ERROR, HTTP_STATUS_SUCCESS } from '@/domain/constants';
import type { FileInfo, FileListResponse } from '@/domain/models/files';

// モックデータ生成
const generateMockFiles = (): FileInfo[] => {
  const tags = [
    ['tag-001', 'tag-002'],
    ['tag-003'],
    ['tag-001', 'tag-004'],
    ['tag-002', 'tag-005'],
    [],
    ['tag-001'],
    ['tag-003', 'tag-004'],
    ['tag-002'],
    ['tag-005'],
    ['tag-001', 'tag-003'],
  ];

  const files: FileInfo[] = [
    {
      id: 'file-001',
      name: '田中商事_請求書_202401.pdf',
      size: 1024000,
      mimeType: 'application/pdf',
      description: '2024年1月分の請求書',
      uploadedAt: '2026-01-15T09:30:00Z',
      downloadUrl: 'https://example.com/files/file-001',
      tagIds: tags[0],
    },
    {
      id: 'file-002',
      name: '学校だより_2月号.pdf',
      size: 512000,
      mimeType: 'application/pdf',
      description: '2月の学校だより',
      uploadedAt: '2026-01-14T10:00:00Z',
      downloadUrl: 'https://example.com/files/file-002',
      tagIds: tags[1],
    },
    {
      id: 'file-003',
      name: '運動会のお知らせ.pdf',
      size: 768000,
      mimeType: 'application/pdf',
      description: '春の運動会について',
      uploadedAt: '2026-01-13T14:20:00Z',
      downloadUrl: 'https://example.com/files/file-003',
      tagIds: tags[2],
    },
    {
      id: 'file-004',
      name: '鈴木工務店_見積書.pdf',
      size: 2048000,
      mimeType: 'application/pdf',
      description: 'リフォーム工事の見積書',
      uploadedAt: '2026-01-12T11:45:00Z',
      downloadUrl: 'https://example.com/files/file-004',
      tagIds: tags[3],
    },
    {
      id: 'file-005',
      name: '授業参観のご案内.pdf',
      size: 384000,
      mimeType: 'application/pdf',
      uploadedAt: '2026-01-11T08:15:00Z',
      downloadUrl: 'https://example.com/files/file-005',
      tagIds: tags[4],
    },
    {
      id: 'file-006',
      name: '佐藤電機_領収書_202312.pdf',
      size: 256000,
      mimeType: 'application/pdf',
      description: '2023年12月分の領収書',
      uploadedAt: '2026-01-10T16:30:00Z',
      downloadUrl: 'https://example.com/files/file-006',
      tagIds: tags[5],
    },
    {
      id: 'file-007',
      name: '修学旅行しおり.pdf',
      size: 3072000,
      mimeType: 'application/pdf',
      description: '6年生修学旅行のしおり',
      uploadedAt: '2026-01-09T13:00:00Z',
      downloadUrl: 'https://example.com/files/file-007',
      tagIds: tags[6],
    },
    {
      id: 'file-008',
      name: '家族写真_2024.jpg',
      size: 4096000,
      mimeType: 'image/jpeg',
      description: '家族写真',
      uploadedAt: '2026-01-08T18:00:00Z',
      downloadUrl: 'https://example.com/files/file-008',
      tagIds: tags[7],
    },
    {
      id: 'file-009',
      name: '山田病院_診察券.png',
      size: 128000,
      mimeType: 'image/png',
      uploadedAt: '2026-01-07T09:00:00Z',
      downloadUrl: 'https://example.com/files/file-009',
      tagIds: tags[8],
    },
    {
      id: 'file-010',
      name: '給食献立表_1月.pdf',
      size: 640000,
      mimeType: 'application/pdf',
      description: '1月の給食献立',
      uploadedAt: '2026-01-06T12:00:00Z',
      downloadUrl: 'https://example.com/files/file-010',
      tagIds: tags[9],
    },
    {
      id: 'file-011',
      name: '高橋不動産_契約書.pdf',
      size: 1536000,
      mimeType: 'application/pdf',
      description: '賃貸契約書',
      uploadedAt: '2026-01-05T10:30:00Z',
      downloadUrl: 'https://example.com/files/file-011',
      tagIds: ['tag-001'],
    },
    {
      id: 'file-012',
      name: 'PTA総会資料.pdf',
      size: 896000,
      mimeType: 'application/pdf',
      uploadedAt: '2026-01-04T15:00:00Z',
      downloadUrl: 'https://example.com/files/file-012',
      tagIds: ['tag-003'],
    },
    {
      id: 'file-013',
      name: '伊藤クリニック_処方箋.jpg',
      size: 512000,
      mimeType: 'image/jpeg',
      uploadedAt: '2026-01-03T11:20:00Z',
      downloadUrl: 'https://example.com/files/file-013',
      tagIds: ['tag-005'],
    },
    {
      id: 'file-014',
      name: '保護者会のお知らせ.pdf',
      size: 320000,
      mimeType: 'application/pdf',
      uploadedAt: '2026-01-02T14:45:00Z',
      downloadUrl: 'https://example.com/files/file-014',
      tagIds: ['tag-003'],
    },
    {
      id: 'file-015',
      name: '渡辺商店_レシート.png',
      size: 192000,
      mimeType: 'image/png',
      uploadedAt: '2026-01-01T09:15:00Z',
      downloadUrl: 'https://example.com/files/file-015',
      tagIds: ['tag-002'],
    },
    {
      id: 'file-016',
      name: '卒業式のご案内.pdf',
      size: 448000,
      mimeType: 'application/pdf',
      description: '卒業式についてのお知らせ',
      uploadedAt: '2025-12-31T16:00:00Z',
      downloadUrl: 'https://example.com/files/file-016',
      tagIds: ['tag-003', 'tag-004'],
    },
    {
      id: 'file-017',
      name: '加藤税理士_確定申告.pdf',
      size: 1280000,
      mimeType: 'application/pdf',
      uploadedAt: '2025-12-30T10:00:00Z',
      downloadUrl: 'https://example.com/files/file-017',
      tagIds: ['tag-001'],
    },
    {
      id: 'file-018',
      name: '夏休みのしおり.pdf',
      size: 960000,
      mimeType: 'application/pdf',
      description: '夏休みの過ごし方',
      uploadedAt: '2025-12-29T13:30:00Z',
      downloadUrl: 'https://example.com/files/file-018',
      tagIds: ['tag-003'],
    },
    {
      id: 'file-019',
      name: '小林歯科_診察券.jpg',
      size: 256000,
      mimeType: 'image/jpeg',
      uploadedAt: '2025-12-28T11:00:00Z',
      downloadUrl: 'https://example.com/files/file-019',
      tagIds: ['tag-005'],
    },
    {
      id: 'file-020',
      name: '遠足のしおり.pdf',
      size: 704000,
      mimeType: 'application/pdf',
      description: '秋の遠足について',
      uploadedAt: '2025-12-27T14:00:00Z',
      downloadUrl: 'https://example.com/files/file-020',
      tagIds: ['tag-003', 'tag-004'],
    },
  ];

  return files;
};

const MOCK_FILES = generateMockFiles();

/**
 * ファイル管理APIのMSWハンドラー
 */
export const getFilesHandlers = () => {
  // ファイル一覧取得
  const getFiles = http.get('*/api/files', async ({ request }) => {
    await delay(800);

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const tagIdsParam = url.searchParams.get('tagIds') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    // タグIDでフィルタリング
    let filteredFiles = MOCK_FILES;

    if (tagIdsParam) {
      const tagIds = tagIdsParam.split(',');
      filteredFiles = filteredFiles.filter((file) =>
        tagIds.some((tagId) => file.tagIds.includes(tagId))
      );
    }

    // 検索キーワードでフィルタリング
    if (search) {
      filteredFiles = filteredFiles.filter(
        (file) =>
          file.name.toLowerCase().includes(search.toLowerCase()) ||
          file.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // ページネーション
    const total = filteredFiles.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedFiles = filteredFiles.slice(start, end);

    const response: FileListResponse = {
      files: paginatedFiles,
      total,
      page,
      limit,
    };

    return HttpResponse.json(response, {
      status: HTTP_STATUS_SUCCESS.OK,
    });
  });

  // ファイルアップロード
  const uploadFile = http.post('*/api/files', async ({ request }) => {
    await delay(1500);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;

    if (!file) {
      return HttpResponse.json(
        { message: 'ファイルが選択されていません', code: 'NO_FILE' },
        { status: HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST }
      );
    }

    // ファイルサイズチェック（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return HttpResponse.json(
        {
          message: 'ファイルサイズが大きすぎます（最大10MB）',
          code: 'FILE_TOO_LARGE',
        },
        { status: HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST }
      );
    }

    // ファイル形式チェック
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return HttpResponse.json(
        {
          message: 'サポートされていないファイル形式です',
          code: 'INVALID_FILE_TYPE',
        },
        { status: HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST }
      );
    }

    const newFile: FileInfo = {
      id: `file-${Date.now()}`,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      description: description || undefined,
      uploadedAt: new Date().toISOString(),
      downloadUrl: `https://example.com/files/file-${Date.now()}`,
      tagIds: [],
    };

    return HttpResponse.json(
      { file: newFile },
      { status: HTTP_STATUS_SUCCESS.CREATED }
    );
  });

  // 個別ファイル取得
  const getFile = http.get('*/api/files/:id', async ({ params }) => {
    await delay(500);

    const { id } = params;
    const file = MOCK_FILES.find((f) => f.id === id);

    if (!file) {
      return HttpResponse.json(
        { message: 'ファイルが見つかりません', code: 'FILE_NOT_FOUND' },
        { status: HTTP_STATUS_CLIENT_ERROR.NOT_FOUND }
      );
    }

    return HttpResponse.json({ file }, { status: HTTP_STATUS_SUCCESS.OK });
  });

  return [getFiles, uploadFile, getFile];
};
