/**
 * SavedSearchCondition（保存済み検索条件）
 * ユーザーが保存した検索条件。複雑な検索を再利用できる。
 */
export interface SavedSearchCondition {
  /** 検索条件の一意識別子 */
  id: string;

  /** ユーザー ID */
  userId: string;

  /** 検索条件の名前 */
  conditionName: string;

  /** キーワード検索（最大 100 chars） */
  searchKeyword?: string | null;

  /** タグフィルタ（複数選択） */
  tagIds?: string[] | null;

  /** アップロード日付範囲（開始） */
  dateRangeStart?: string | null;

  /** アップロード日付範囲（終了） */
  dateRangeEnd?: string | null;

  /** 作成日時（UTC） */
  createdAt: string;

  /** 最終更新日時（UTC） */
  updatedAt: string;
}

/**
 * 検索フィルター条件
 */
export interface SearchFilter {
  search?: string;
  tagIds?: string[];
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

/**
 * SavedSearchCondition 作成・更新リクエスト
 */
export interface SaveSearchConditionRequest {
  conditionName: string;
  searchKeyword?: string;
  tagIds?: string[];
  dateRangeStart?: string;
  dateRangeEnd?: string;
}
