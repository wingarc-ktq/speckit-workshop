/**
 * タグ管理のドメインモデル
 */

/**
 * タグの色
 */
export type TagColor = 'blue' | 'red' | 'yellow' | 'green' | 'purple' | 'orange' | 'gray';

/**
 * タグ情報
 */
export interface TagInfo {
  /** タグID */
  readonly id: string;
  /** タグ名 */
  readonly name: string;
  /** タグの色 */
  readonly color: TagColor;
  /** 作成日時（ISO 8601形式） */
  readonly createdAt: string;
  /** 更新日時（ISO 8601形式） */
  readonly updatedAt: string;
}

/**
 * タグ一覧レスポンス
 */
export interface TagListResponse {
  /** タグ一覧 */
  readonly tags: TagInfo[];
}

/**
 * タグレスポンス
 */
export interface TagResponse {
  readonly tag: TagInfo;
}

/**
 * タグカラーパレット
 * MUIのカラーに対応
 */
export const TAG_COLOR_PALETTE: Record<TagColor, { light: string; main: string; dark: string }> = {
  blue: {
    light: '#64b5f6',
    main: '#2196f3',
    dark: '#1976d2',
  },
  red: {
    light: '#e57373',
    main: '#f44336',
    dark: '#d32f2f',
  },
  yellow: {
    light: '#fff176',
    main: '#ffeb3b',
    dark: '#fbc02d',
  },
  green: {
    light: '#81c784',
    main: '#4caf50',
    dark: '#388e3c',
  },
  purple: {
    light: '#ba68c8',
    main: '#9c27b0',
    dark: '#7b1fa2',
  },
  orange: {
    light: '#ffb74d',
    main: '#ff9800',
    dark: '#f57c00',
  },
  gray: {
    light: '#bdbdbd',
    main: '#9e9e9e',
    dark: '#616161',
  },
};

/**
 * タグの色を取得
 */
export const getTagColor = (color: TagColor): { light: string; main: string; dark: string } => {
  return TAG_COLOR_PALETTE[color];
};
