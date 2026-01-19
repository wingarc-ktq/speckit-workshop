/**
 * ファイル管理のドメインモデル
 */

/**
 * ファイル情報
 */
export interface FileInfo {
  /** ファイルID */
  readonly id: string;
  /** ファイル名 */
  readonly name: string;
  /** ファイルサイズ（バイト） */
  readonly size: number;
  /** MIMEタイプ */
  readonly mimeType: string;
  /** ファイルの説明 */
  readonly description?: string;
  /** アップロード日時（ISO 8601形式） */
  readonly uploadedAt: string;
  /** ダウンロードURL */
  readonly downloadUrl: string;
  /** タグID一覧 */
  readonly tagIds: string[];
}

/**
 * ファイル一覧レスポンス
 */
export interface FileListResponse {
  /** ファイル一覧 */
  readonly files: FileInfo[];
  /** 総件数 */
  readonly total: number;
  /** 現在のページ番号 */
  readonly page: number;
  /** 1ページあたりの件数 */
  readonly limit: number;
}

/**
 * ファイルレスポンス
 */
export interface FileResponse {
  readonly file: FileInfo;
}

/**
 * ファイル取得パラメータ
 */
export interface GetFilesParams {
  /** ページ番号 */
  page?: number;
  /** 1ページあたりの件数 */
  limit?: number;
  /** 検索キーワード（ファイル名） */
  search?: string;
  /** タグIDで絞り込み */
  tagIds?: string[];
  /** ソート項目 */
  sortBy?: 'name' | 'uploadedAt' | 'size';
  /** ソート順 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * ファイルアップロードデータ
 */
export interface UploadFileData {
  /** アップロードするファイル */
  file: File;
  /** ファイルの説明 */
  description?: string;
  /** タグID一覧 */
  tagIds?: string[];
}

/**
 * 対応しているファイル形式
 */
export const SUPPORTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

/**
 * ファイル拡張子とMIMEタイプのマッピング
 */
export const FILE_TYPE_MAP = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
} as const;

/**
 * 最大ファイルサイズ（バイト）
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 最大同時アップロードファイル数
 */
export const MAX_FILES_COUNT = 20;

/**
 * ファイル形式のバリデーション
 */
export const validateFileType = (file: File): boolean => {
  return SUPPORTED_FILE_TYPES.includes(file.type as (typeof SUPPORTED_FILE_TYPES)[number]);
};

/**
 * ファイルサイズのバリデーション
 */
export const validateFileSize = (file: File, maxSize: number = MAX_FILE_SIZE): boolean => {
  return file.size <= maxSize;
};

/**
 * ファイル数のバリデーション
 */
export const validateFileCount = (files: File[], maxCount: number = MAX_FILES_COUNT): boolean => {
  return files.length <= maxCount;
};

/**
 * ファイルサイズを人間が読みやすい形式に変換
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

/**
 * MIMEタイプからファイル拡張子を取得
 */
export const getFileExtension = (mimeType: string): string => {
  const extensions = FILE_TYPE_MAP[mimeType as keyof typeof FILE_TYPE_MAP];
  return extensions ? extensions[0] : '';
};
