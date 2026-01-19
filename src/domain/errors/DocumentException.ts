import { ApplicationException } from './ApplicationException';

/**
 * Document 関連エラー
 */
export class DocumentException extends ApplicationException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Document not found エラー
 */
export class DocumentNotFoundException extends DocumentException {
  constructor(id: string) {
    super(`Document with id "${id}" not found`);
  }
}

/**
 * Document 削除エラー
 */
export class DocumentDeletionException extends DocumentException {
  constructor(message: string = 'Failed to delete document') {
    super(message);
  }
}

/**
 * Document 更新エラー
 */
export class DocumentUpdateException extends DocumentException {
  constructor(message: string = 'Failed to update document') {
    super(message);
  }
}
