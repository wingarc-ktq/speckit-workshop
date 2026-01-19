/**
 * タグの定義と色情報
 */

export interface TagInfo {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
}

export const TAG_MAP: Record<string, TagInfo> = {
  'tag-1': {
    id: 'tag-1',
    name: '完了',
    color: '#fff',
    backgroundColor: '#1976d2', // Blue
  },
  'tag-2': {
    id: 'tag-2',
    name: '契約書',
    color: '#fff',
    backgroundColor: '#00bcd4', // Cyan
  },
  'tag-3': {
    id: 'tag-3',
    name: '請求書',
    color: '#fff',
    backgroundColor: '#4caf50', // Green
  },
  'tag-4': {
    id: 'tag-4',
    name: '未処理',
    color: '#fff',
    backgroundColor: '#ffa726', // Orange
  },
  'tag-5': {
    id: 'tag-5',
    name: '処理中',
    color: '#fff',
    backgroundColor: '#9c27b0', // Purple
  },
  'tag-6': {
    id: 'tag-6',
    name: '議事録',
    color: '#fff',
    backgroundColor: '#10b981', // Emerald
  },
};

export const getTagInfo = (tagId: string): TagInfo => {
  return TAG_MAP[tagId] || {
    id: tagId,
    name: tagId,
    color: '#fff',
    backgroundColor: '#757575',
  };
};

export const getAllTags = (): TagInfo[] => {
  return Object.values(TAG_MAP);
};
