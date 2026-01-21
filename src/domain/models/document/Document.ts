import type { Tag } from '../tag/Tag';

/**
 * ファイル形式タイプ
 */
export type FileFormat = 'pdf' | 'docx' | 'xlsx' | 'jpg' | 'png' | 'pptx';

/**
 * Document エンティティ
 * 文書管理システムで管理される主要エンティティ
 */
export interface Document {
  /** 文書の一意識別子 */
  id: string;

  /** オリジナルファイル名（拡張子含む）*/
  fileName: string;

  /** ファイルサイズ（バイト単位）*/
  fileSize: number;

  /** ファイル形式（MIME type） */
  fileFormat: FileFormat;

  /** アップロード日時（UTC） */
  uploadedAt: string;

  /** 最終更新日時（UTC） */
  updatedAt: string;

  /** アップロードユーザー ID */
  uploadedByUserId: string;

  /** 付与されたタグ（多対多関係） */
  tags: Tag[];

  /** ゴミ箱に移動済みフラグ */
  isDeleted: boolean;

  /** 削除日時（30日後に自動完全削除） */
  deletedAt: string | null;
}

/**
 * Document フィルター条件
 */
export interface DocumentFilter {
  search?: string;
  tagIds?: string[];
  isDeleted?: boolean;
}

/**
 * Document 作成リクエスト
 */
export interface CreateDocumentRequest {
  file: File;
  tagIds?: string[];
}

/**
 * Document 更新リクエスト
 */
export interface UpdateDocumentRequest {
  fileName?: string;
  tagIds?: string[];
}

/**
 * Document リストレスポンス
 */
export interface DocumentListResponse {
  data: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
