import { delay, http, HttpResponse } from 'msw';

import { HTTP_STATUS_CLIENT_ERROR, HTTP_STATUS_SUCCESS } from '@/domain/constants';
import type { FileInfo, FileListResponse } from '@/domain/models/files';

import { MOCK_TAGS } from './tags';

// アップロードされたファイルのデータを保存するMap
export const uploadedFilesData = new Map<string, Blob>();

/**
 * 表示可能なモックPDFを生成する関数
 * 実際に表示できるPDFバイナリを返す
 */
const generateMockPdf = (filename: string): Uint8Array => {
  // シンプルな有効なPDFを生成（テキストを含む1ページのPDF）
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 120
>>
stream
BT
/F1 24 Tf
50 750 Td
(Mock PDF: ${filename}) Tj
0 -30 Td
/F1 12 Tf
(This is a mock PDF file for preview.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000314 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
484
%%EOF`;

  // 文字列をUint8Arrayに変換
  const encoder = new TextEncoder();
  return encoder.encode(pdfContent);
};

// モックデータ生成
const generateMockFiles = (): FileInfo[] => {
  const tags = [
    ['tag-001', 'tag-002'], // file-001: 請求書 -> 重要, 学校
    ['tag-002'], // file-002: 学校だより -> 学校
    ['tag-002', 'tag-003'], // file-003: 運動会のお知らせ -> 学校, 行事
    ['tag-002', 'tag-005'], // file-004: 見積書 -> 学校, 医療
    ['tag-002', 'tag-003'], // file-005: 授業参観 -> 学校, 行事
    ['tag-001'], // file-006: 領収書 -> 重要
    ['tag-003', 'tag-004'], // file-007: お祭り -> 行事, お知らせ
    ['tag-002'], // file-008: 健康診断 -> 学校
    ['tag-005'], // file-009: 医療 -> 医療
    ['tag-001', 'tag-003'], // file-010: イベント -> 重要, 行事
  ];

  const files: FileInfo[] = [
    {
      id: 'file-001',
      name: '田中商事_請求書_202401.pdf',
      size: 1024000,
      mimeType: 'application/pdf',
      description: '2024年1月分の請求書',
      uploadedAt: '2026-01-15T09:30:00Z',
      downloadUrl: '/api/files/file-001/download',
      tagIds: tags[0],
    },
    {
      id: 'file-002',
      name: '学校だより_2月号.pdf',
      size: 512000,
      mimeType: 'application/pdf',
      description: '2月の学校だより',
      uploadedAt: '2026-01-14T10:00:00Z',
      downloadUrl: '/api/files/file-002/download',
      tagIds: tags[1],
    },
    {
      id: 'file-003',
      name: '運動会のお知らせ.pdf',
      size: 768000,
      mimeType: 'application/pdf',
      description: '春の運動会について',
      uploadedAt: '2026-01-13T14:20:00Z',
      downloadUrl: '/api/files/file-003/download',
      tagIds: tags[2],
    },
    {
      id: 'file-004',
      name: '鈴木工務店_見積書.pdf',
      size: 2048000,
      mimeType: 'application/pdf',
      description: 'リフォーム工事の見積書',
      uploadedAt: '2026-01-12T11:45:00Z',
      downloadUrl: '/api/files/file-004/download',
      tagIds: tags[3],
    },
    {
      id: 'file-005',
      name: '授業参観のご案内.pdf',
      size: 384000,
      mimeType: 'application/pdf',
      uploadedAt: '2026-01-11T08:15:00Z',
      downloadUrl: '/api/files/file-005/download',
      tagIds: tags[4],
    },
    {
      id: 'file-006',
      name: '佐藤電機_領収書_202312.pdf',
      size: 256000,
      mimeType: 'application/pdf',
      description: '2023年12月分の領収書',
      uploadedAt: '2026-01-10T16:30:00Z',
      downloadUrl: '/api/files/file-006/download',
      tagIds: tags[5],
    },
    {
      id: 'file-007',
      name: '修学旅行しおり.pdf',
      size: 3072000,
      mimeType: 'application/pdf',
      description: '6年生修学旅行のしおり',
      uploadedAt: '2026-01-09T13:00:00Z',
      downloadUrl: '/api/files/file-007/download',
      tagIds: tags[6],
    },
    {
      id: 'file-008',
      name: '家族写真_2024.jpg',
      size: 4096000,
      mimeType: 'image/jpeg',
      description: '家族写真',
      uploadedAt: '2026-01-08T18:00:00Z',
      downloadUrl: '/api/files/file-008/download',
      tagIds: tags[7],
    },
    {
      id: 'file-009',
      name: '山田病院_診察券.png',
      size: 128000,
      mimeType: 'image/png',
      uploadedAt: '2026-01-07T09:00:00Z',
      downloadUrl: '/api/files/file-009/download',
      tagIds: tags[8],
    },
    {
      id: 'file-010',
      name: '給食献立表_1月.pdf',
      size: 640000,
      mimeType: 'application/pdf',
      description: '1月の給食献立',
      uploadedAt: '2026-01-06T12:00:00Z',
      downloadUrl: '/api/files/file-010/download',
      tagIds: tags[9],
    },
    {
      id: 'file-011',
      name: '高橋不動産_契約書.pdf',
      size: 1536000,
      mimeType: 'application/pdf',
      description: '賃貸契約書',
      uploadedAt: '2026-01-05T10:30:00Z',
      downloadUrl: '/api/files/file-011/download',
      tagIds: ['tag-001'],
    },
    {
      id: 'file-012',
      name: 'PTA総会資料.pdf',
      size: 896000,
      mimeType: 'application/pdf',
      uploadedAt: '2026-01-04T15:00:00Z',
      downloadUrl: '/api/files/file-012/download',
      tagIds: ['tag-003'],
    },
    {
      id: 'file-013',
      name: '伊藤クリニック_処方箋.jpg',
      size: 512000,
      mimeType: 'image/jpeg',
      uploadedAt: '2026-01-03T11:20:00Z',
      downloadUrl: '/api/files/file-013/download',
      tagIds: ['tag-005'],
    },
    {
      id: 'file-014',
      name: '保護者会のお知らせ.pdf',
      size: 320000,
      mimeType: 'application/pdf',
      uploadedAt: '2026-01-02T14:45:00Z',
      downloadUrl: '/api/files/file-014/download',
      tagIds: ['tag-003'],
    },
    {
      id: 'file-015',
      name: '渡辺商店_レシート.png',
      size: 192000,
      mimeType: 'image/png',
      uploadedAt: '2026-01-01T09:15:00Z',
      downloadUrl: '/api/files/file-015/download',
      tagIds: ['tag-002'],
    },
    {
      id: 'file-016',
      name: '卒業式のご案内.pdf',
      size: 448000,
      mimeType: 'application/pdf',
      description: '卒業式についてのお知らせ',
      uploadedAt: '2025-12-31T16:00:00Z',
      downloadUrl: '/api/files/file-016/download',
      tagIds: ['tag-003', 'tag-004'],
    },
    {
      id: 'file-017',
      name: '加藤税理士_確定申告.pdf',
      size: 1280000,
      mimeType: 'application/pdf',
      uploadedAt: '2025-12-30T10:00:00Z',
      downloadUrl: '/api/files/file-017/download',
      tagIds: ['tag-001'],
    },
    {
      id: 'file-018',
      name: '夏休みのしおり.pdf',
      size: 960000,
      mimeType: 'application/pdf',
      description: '夏休みの過ごし方',
      uploadedAt: '2025-12-29T13:30:00Z',
      downloadUrl: '/api/files/file-018/download',
      tagIds: ['tag-003'],
    },
    {
      id: 'file-019',
      name: '小林歯科_診察券.jpg',
      size: 256000,
      mimeType: 'image/jpeg',
      uploadedAt: '2025-12-28T11:00:00Z',
      downloadUrl: '/api/files/file-019/download',
      tagIds: ['tag-005'],
    },
    {
      id: 'file-020',
      name: '遠足のしおり.pdf',
      size: 704000,
      mimeType: 'application/pdf',
      description: '秋の遠足について',
      uploadedAt: '2025-12-27T14:00:00Z',
      downloadUrl: '/api/files/file-020/download',
      tagIds: ['tag-003', 'tag-004'],
    },
  ];

  return files;
};

// モックファイルをミュータブルな配列として保持
export const MOCK_FILES: FileInfo[] = generateMockFiles();

/**
 * ファイル管理APIのMSWハンドラー
 */
export const getFilesHandlers = () => {
  // ファイル一覧取得
  const getFiles = http.get('*/api/files', async ({ request }) => {
    await delay(800);

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const tagIds = url.searchParams.getAll('tagIds');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const sortBy = url.searchParams.get('sortBy') || 'uploadedAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // タグIDでフィルタリング
    let filteredFiles = MOCK_FILES;

    if (tagIds.length > 0) {
      filteredFiles = filteredFiles.filter((file) =>
        tagIds.every((tagId) => file.tagIds.includes(tagId))
      );
    }

    // 検索キーワードでフィルタリング（ファイル名、description、タグ名を検索対象とする）
    if (search) {
      filteredFiles = filteredFiles.filter((file) => {
        // ファイル名とdescriptionで検索
        const matchesFileInfo =
          file.name.toLowerCase().includes(search.toLowerCase()) ||
          file.description?.toLowerCase().includes(search.toLowerCase());

        // タグ名で検索
        const matchesTag = file.tagIds.some((tagId) => {
          const tag = MOCK_TAGS.find((t) => t.id === tagId);
          return tag && tag.name.toLowerCase().includes(search.toLowerCase());
        });

        return matchesFileInfo || matchesTag;
      });
    }

    // ソート
    const compare = (a: typeof filteredFiles[number], b: typeof filteredFiles[number]) => {
      let result = 0;
      if (sortBy === 'name') {
        result = a.name.localeCompare(b.name, 'ja');
      } else if (sortBy === 'size') {
        result = a.size - b.size;
      } else {
        result = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      return sortOrder === 'asc' ? result : -result;
    };

    filteredFiles = [...filteredFiles].sort(compare);

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
    const tagIdsString = formData.get('tagIds') as string;

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

    // タグIDをパース
    const tagIds = tagIdsString ? tagIdsString.split(',').filter(Boolean) : [];

    const fileId = `file-${Date.now()}`;
    const newFile: FileInfo = {
      id: fileId,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      description: description || undefined,
      uploadedAt: new Date().toISOString(),
      downloadUrl: `/api/files/${fileId}/download`,
      tagIds,
    };

    // 実際のファイルデータを保存
    uploadedFilesData.set(fileId, file);

    // モック配列の先頭に追加（最新ファイルが先頭に来るように）
    MOCK_FILES.unshift(newFile);

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

  // ファイル更新
  const updateFile = http.put('*/api/files/:id', async ({ params, request }) => {
    await delay(500);

    const { id } = params;
    const fileIndex = MOCK_FILES.findIndex((f) => f.id === id);

    if (fileIndex === -1) {
      return HttpResponse.json(
        { message: 'ファイルが見つかりません', code: 'FILE_NOT_FOUND' },
        { status: HTTP_STATUS_CLIENT_ERROR.NOT_FOUND }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
      tagIds?: string[];
    };

    if (body.name !== undefined) {
      const trimmedName = body.name.trim();
      if (!trimmedName) {
        return HttpResponse.json(
          { message: 'ファイル名は必須です', code: 'INVALID_NAME' },
          { status: HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST }
        );
      }
      if (trimmedName.length > 255) {
        return HttpResponse.json(
          { message: 'ファイル名は255文字以内です', code: 'INVALID_NAME_LENGTH' },
          { status: HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST }
        );
      }
    }

    if (body.description !== undefined && body.description.length > 500) {
      return HttpResponse.json(
        { message: '説明は500文字以内です', code: 'INVALID_DESCRIPTION_LENGTH' },
        { status: HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST }
      );
    }

    const current = MOCK_FILES[fileIndex];
    const updated: FileInfo = {
      ...current,
      name: body.name !== undefined ? body.name : current.name,
      description: body.description !== undefined ? body.description : current.description,
      tagIds: body.tagIds !== undefined ? body.tagIds : current.tagIds,
    };

    MOCK_FILES[fileIndex] = updated;

    return HttpResponse.json({ file: updated }, { status: HTTP_STATUS_SUCCESS.OK });
  });

  // ファイルダウンロード
  const downloadFile = http.get('*/api/files/:id/download', async ({ params }) => {
    await delay(500);

    const { id } = params;
    const file = MOCK_FILES.find((f) => f.id === id);

    // ファイルが見つからない場合、フォールバック用のコンテンツを返す
    if (!file) {
      // エラー表示用のシンプルなPDFを返す
      const errorPdfContent = generateMockPdf('ファイルが見つかりません');
      return new HttpResponse(errorPdfContent, {
        status: HTTP_STATUS_SUCCESS.OK,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="file-not-found.pdf"',
        },
      });
    }

    // アップロードされた実際のファイルがある場合、それを返す
    const uploadedFile = uploadedFilesData.get(id as string);
    if (uploadedFile) {
      return new HttpResponse(uploadedFile, {
        status: HTTP_STATUS_SUCCESS.OK,
        headers: {
          'Content-Type': file.mimeType,
          'Content-Disposition': `inline; filename="${encodeURIComponent(file.name)}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        },
      });
    }

    // モックPDFまたは画像データを返す
    if (file.mimeType === 'application/pdf') {
      // 実際に表示可能なPDFを生成
      const pdfContent = generateMockPdf(file.name);
      return new HttpResponse(pdfContent, {
        status: HTTP_STATUS_SUCCESS.OK,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${encodeURIComponent(file.name)}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        },
      });
    }

    if (file.mimeType.startsWith('image/')) {
      // 1x1の透明PNG
      const pngData = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
        0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]);
      return new HttpResponse(pngData, {
        status: HTTP_STATUS_SUCCESS.OK,
        headers: {
          'Content-Type': file.mimeType,
          'Content-Disposition': `inline; filename="${encodeURIComponent(file.name)}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        },
      });
    }

    // その他のファイル
    return new HttpResponse('Mock file content', {
      status: HTTP_STATUS_SUCCESS.OK,
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      },
    });
  });

  return [getFiles, uploadFile, getFile, updateFile, downloadFile];
};
