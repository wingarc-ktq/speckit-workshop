import { delay, http, HttpResponse } from 'msw';

import { HTTP_STATUS_CLIENT_ERROR, HTTP_STATUS_SUCCESS } from '@/domain/constants';
import type { FileInfo, TrashFileInfo, TrashListResponse } from '@/domain/models/files';

import { MOCK_FILES, uploadedFilesData } from './files';

const TRASH_RETENTION_DAYS = 30;

let TRASH_FILES: TrashFileInfo[] = [];

const cleanupTrash = () => {
  const cutoff = Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  TRASH_FILES = TRASH_FILES.filter(
    (file) => new Date(file.deletedAt).getTime() >= cutoff
  );
};

const moveToTrash = (file: FileInfo): TrashFileInfo => ({
  ...file,
  deletedAt: new Date().toISOString(),
});

/**
 * ゴミ箱管理APIのMSWハンドラー
 */
export const getTrashHandlers = () => {
  // ファイル削除（ゴミ箱へ移動）
  const deleteFile = http.delete('*/api/files/:id', async ({ params }) => {
    await delay(500);

    const { id } = params;
    const fileIndex = MOCK_FILES.findIndex((file) => file.id === id);

    if (fileIndex === -1) {
      return HttpResponse.json(
        { message: 'ファイルが見つかりません', code: 'FILE_NOT_FOUND' },
        { status: HTTP_STATUS_CLIENT_ERROR.NOT_FOUND }
      );
    }

    const [removedFile] = MOCK_FILES.splice(fileIndex, 1);
    TRASH_FILES.unshift(moveToTrash(removedFile));

    return new HttpResponse(null, { status: HTTP_STATUS_SUCCESS.NO_CONTENT });
  });

  // ゴミ箱一覧取得
  const getTrash = http.get('*/api/trash', async () => {
    await delay(500);
    cleanupTrash();

    const response: TrashListResponse = {
      files: [...TRASH_FILES].sort(
        (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
      ),
    };

    return HttpResponse.json(response, { status: HTTP_STATUS_SUCCESS.OK });
  });

  // ゴミ箱から復元
  const restoreFile = http.post('*/api/trash/:id/restore', async ({ params }) => {
    await delay(500);

    const { id } = params;
    const trashIndex = TRASH_FILES.findIndex((file) => file.id === id);

    if (trashIndex === -1) {
      return HttpResponse.json(
        { message: 'ファイルが見つかりません', code: 'FILE_NOT_FOUND' },
        { status: HTTP_STATUS_CLIENT_ERROR.NOT_FOUND }
      );
    }

    const [restored] = TRASH_FILES.splice(trashIndex, 1);
    const { deletedAt, ...restoredFile } = restored;
    MOCK_FILES.unshift(restoredFile);

    return new HttpResponse(null, { status: HTTP_STATUS_SUCCESS.NO_CONTENT });
  });

  // 完全削除
  const permanentlyDeleteFile = http.delete('*/api/trash/:id', async ({ params }) => {
    await delay(500);

    const { id } = params;
    const trashIndex = TRASH_FILES.findIndex((file) => file.id === id);

    if (trashIndex === -1) {
      return HttpResponse.json(
        { message: 'ファイルが見つかりません', code: 'FILE_NOT_FOUND' },
        { status: HTTP_STATUS_CLIENT_ERROR.NOT_FOUND }
      );
    }

    const [removed] = TRASH_FILES.splice(trashIndex, 1);
    uploadedFilesData.delete(removed.id);

    return new HttpResponse(null, { status: HTTP_STATUS_SUCCESS.NO_CONTENT });
  });

  return [deleteFile, getTrash, restoreFile, permanentlyDeleteFile];
};
