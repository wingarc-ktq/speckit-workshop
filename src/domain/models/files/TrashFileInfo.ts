/**
 * ゴミ箱ファイル情報
 */
import type { FileInfo } from './FileInfo';

export interface TrashFileInfo extends FileInfo {
  /** 削除日時（ISO 8601形式） */
  readonly deletedAt: string;
}

export interface TrashListResponse {
  /** ゴミ箱ファイル一覧 */
  readonly files: TrashFileInfo[];
}
