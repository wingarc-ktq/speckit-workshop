/**
 * Tag セマンティック色
 */
export type TagColor = 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info';

/**
 * Tag エンティティ
 * 文書を分類・整理するためのラベル。ユーザーが自由に作成・管理できる。
 */
export interface Tag {
  /** タグの一意識別子 */
  id: string;

  /** タグ名（ユーザー入力） */
  name: string;

  /** タグの色（セマンティック） */
  color: TagColor;

  /** 作成日時（UTC） */
  createdAt: string;

  /** 最終更新日時（UTC） */
  updatedAt: string;

  /** 作成ユーザー ID */
  createdByUserId: string;
}

/**
 * Tag 作成リクエスト
 */
export interface CreateTagRequest {
  name: string;
  color: TagColor;
}

/**
 * Tag 更新リクエスト
 */
export interface UpdateTagRequest {
  name?: string;
  color?: TagColor;
}
