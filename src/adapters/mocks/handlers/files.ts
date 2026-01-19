import { http, HttpResponse, delay } from 'msw';

import {
  HTTP_STATUS_SUCCESS,
} from '@/domain/constants';

// ダミーのファイル一覧データを生成
const generateMockFiles = () => {
  const files = [
    {
      id: 'file-1',
      name: '田中商事_請求書_202401.pdf',
      size: 2340000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 15, 18, 30).toISOString(),
      downloadUrl: '/api/v1/files/file-1/download',
      tagIds: ['tag-1', 'tag-2'],
    },
    {
      id: 'file-2',
      name: '会議室予約_スケジュール.xlsx',
      size: 512000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedAt: new Date(2024, 0, 14, 18, 0).toISOString(),
      downloadUrl: '/api/v1/files/file-2/download',
      tagIds: ['tag-3'],
    },
    {
      id: 'file-3',
      name: '緊急対応_報告書.pdf',
      size: 1228800,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 14, 2, 30).toISOString(),
      downloadUrl: '/api/v1/files/file-3/download',
      tagIds: ['tag-4', 'tag-5'],
    },
    {
      id: 'file-4',
      name: '鈴木工業_契約書_2024.pdf',
      size: 2048000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 12, 20, 20).toISOString(),
      downloadUrl: '/api/v1/files/file-4/download',
      tagIds: ['tag-5', 'tag-2'],
    },
    {
      id: 'file-5',
      name: '営業レポート_202401.docx',
      size: 2560000,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(2024, 0, 12, 0, 10).toISOString(),
      downloadUrl: '/api/v1/files/file-5/download',
      tagIds: ['tag-6'],
    },
    {
      id: 'file-6',
      name: '佐藤建設_契約書_2024.docx',
      size: 1497600,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(2024, 0, 10, 23, 20).toISOString(),
      downloadUrl: '/api/v1/files/file-6/download',
      tagIds: ['tag-5', 'tag-1'],
    },
    {
      id: 'file-7',
      name: '製品カタログ_2024.pdf',
      size: 8388608,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 9, 19, 45).toISOString(),
      downloadUrl: '/api/v1/files/file-7/download',
      tagIds: ['tag-6'],
    },
    {
      id: 'file-8',
      name: '週次会議_議事録_20240108.pdf',
      size: 857088,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 9, 1, 0).toISOString(),
      downloadUrl: '/api/v1/files/file-8/download',
      tagIds: ['tag-3', 'tag-6'],
    },
    {
      id: 'file-9',
      name: '研修資料_新入向け.pdf',
      size: 4194304,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 7, 23, 0).toISOString(),
      downloadUrl: '/api/v1/files/file-9/download',
      tagIds: ['tag-3'],
    },
    {
      id: 'file-10',
      name: '高橋物産_請求書_202312.pdf',
      size: 2097152,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 6, 20, 15).toISOString(),
      downloadUrl: '/api/v1/files/file-10/download',
      tagIds: ['tag-1', 'tag-5'],
    },
    {
      id: 'file-11',
      name: '予算案_2024年度.xlsx',
      size: 3145728,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedAt: new Date(2024, 0, 5, 19, 15).toISOString(),
      downloadUrl: '/api/v1/files/file-11/download',
      tagIds: ['tag-6'],
    },
    {
      id: 'file-12',
      name: '中間報告_プロジェクトA.docx',
      size: 1789952,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(2024, 0, 5, 1, 30).toISOString(),
      downloadUrl: '/api/v1/files/file-12/download',
      tagIds: ['tag-3', 'tag-6'],
    },
    {
      id: 'file-13',
      name: '在庫管理表_202401.xlsx',
      size: 1048576,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedAt: new Date(2024, 0, 3, 18, 45).toISOString(),
      downloadUrl: '/api/v1/files/file-13/download',
      tagIds: ['tag-6', 'tag-2'],
    },
    {
      id: 'file-14',
      name: '営業成績_第4四半期.pdf',
      size: 3145728,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 3, 0, 0).toISOString(),
      downloadUrl: '/api/v1/files/file-14/download',
      tagIds: ['tag-6', 'tag-5'],
    },
    {
      id: 'file-15',
      name: '事業計画書_2024年版.docx',
      size: 2621440,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(2023, 11, 28, 22, 45).toISOString(),
      downloadUrl: '/api/v1/files/file-15/download',
      tagIds: ['tag-3', 'tag-1'],
    },
  ];

  return files;
};

/**
 * ファイル管理API のモックハンドラーを返す関数
 */
export const getFilesAPIMock = () => {
  const getFilesHandler = http.get('*/files', async ({ request }) => {
    await delay(500);

    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search') || '';

    let files = generateMockFiles();

    // 検索クエリでフィルタリング（ファイル名で検索）
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      files = files.filter((file) =>
        file.name.toLowerCase().includes(lowerQuery)
      );
    }

    return new HttpResponse(
      JSON.stringify({
        files,
        total: files.length,
        page: 1,
        limit: 20,
      }),
      {
        status: HTTP_STATUS_SUCCESS.OK,
        headers: { 'content-type': 'application/json' },
      }
    );
  });

  return [getFilesHandler];
};
