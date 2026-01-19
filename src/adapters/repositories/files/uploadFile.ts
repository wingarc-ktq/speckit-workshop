import '@/adapters/axios';

import {
  uploadFile as uploadFileApi,
  type FileResponse,
  type UploadFileBody,
} from '@/adapters/generated/files';

/**
 * ファイルアップロードの型
 */
export type UploadFile = (body: UploadFileBody) => Promise<FileResponse>;

/**
 * ファイルをアップロード
 * @param body - アップロード対象のファイル(Blob)と説明
 * @returns ファイルレスポンス
 */
export const uploadFile: UploadFile = async (body: UploadFileBody) => {
  const response = await uploadFileApi(body);
  return response;
};
