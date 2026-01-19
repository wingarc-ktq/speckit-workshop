/**
 * ローディングをグローバルで表示するクエリのキー
 * @remark
 * - 個別にローディングを表示しないQueryの先頭にこのkeyを入れる
 * - これにより、Queryが実行されている間、グローバルローディングが表示される
 */
export const GLOBAL_LOADING = 'globalLoading';

/**
 * React Query のクエリキー定数
 */
export const QUERY_KEYS = {
  // 認証関連
  AUTH: {
    CURRENT_SESSION: [GLOBAL_LOADING, 'auth', 'currentSession'],
  },

  // ファイル管理関連
  FILES: {
    LIST: [GLOBAL_LOADING, 'files', 'list'],
  },

  // 今後の拡張例
  // USERS: {
  //   LIST: [GLOBAL_LOADING, 'users', 'list'],
  //   DETAIL: (id: string) => [GLOBAL_LOADING, 'users', 'detail', id],
  // },
  //
  // POSTS: {
  //   LIST: [GLOBAL_LOADING, 'posts', 'list'],
  //   DETAIL: (id: string) => [GLOBAL_LOADING, 'posts', 'detail', id],
  //   BY_CATEGORY: (category: string) => [GLOBAL_LOADING, 'posts', 'category', category],
  // },
} as const;
