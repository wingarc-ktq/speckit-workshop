export type FileId = string;

export interface File {
  /** ファイルID */
  id: FileId;

  /** ファイル名 */
  name: string;

  /** ファイルサイズ（バイト） */
  size: number;

  /** MIMEタイプ */
  mimeType: string;

  /** 説明（任意） */
  description: string | null;

  /** アップロード日時 */
  uploadedAt: Date;

  /** ダウンロードURL */
  downloadUrl: string;

  /** タグID一覧 */
  tagIds: string[];
}

/**
 * ファイルバリデーションルール
 * - name: 1〜255文字
 * - size: 0以上、10MB以下（アップロード時）
 * - mimeType: サポート対象: PDF, DOCX, XLSX, JPEG, PNG
 * - description: 最大500文字
 */

/**
 * ファイル状態遷移
 * 1. Uploading: アップロード中
 * 2. Active: 正常にアップロード済み
 * 3. Deleted: 削除済み（ゴミ箱）
 * 4. PermanentlyDeleted: 完全削除済み（30日後）
 */

export interface FileQueryParams {
  /** キーワード検索（ファイル名） */
  search?: string;

  /** タグIDで絞り込み（複数指定可能） */
  tagIds?: string[];

  /** ページ番号（1始まり）デフォルト: 1 */
  page?: number;

  /** 1ページあたりの件数 デフォルト: 20 */
  limit?: number;
}

export interface FileListResponse {
  /** ファイル一覧 */
  files: File[];

  /** 総件数 */
  total: number;

  /** 現在のページ番号 */
  page: number;

  /** 1ページあたりの件数 */
  limit: number;
}

export interface UploadFileRequest {
  /** アップロードするファイル */
  file: globalThis.File; // ネイティブFileオブジェクト

  /** 説明（任意） */
  description?: string;
}

export interface UpdateFileRequest {
  /** 新しいファイル名（任意） */
  name?: string;

  /** 新しい説明（任意） */
  description?: string;

  /** 更新するタグID一覧（任意） */
  tagIds?: string[];
}
