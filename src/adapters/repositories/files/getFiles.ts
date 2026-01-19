import '@/adapters/axios';

import {
  getFiles as getFilesApi,
  type FileListResponse,
  type GetFilesParams,
} from '@/adapters/generated/files';

/**
 * ファイル一覧を取得する関数の型
 */
export type GetFiles = (params?: GetFilesParams) => Promise<FileListResponse>;

/**
 * ファイル一覧を取得
 * @param params - クエリパラメータ（search, tagIds, page, limit）
 * @returns ファイル一覧レスポンス
 */
export const getFiles: GetFiles = async (params?: GetFilesParams) => {
  const response = await getFilesApi(params);
  return response;
};
