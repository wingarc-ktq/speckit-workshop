/**
 * アプリケーションエラー
 */
export class ApplicationException extends Error {
  readonly name: string;
  constructor(error: string) {
    super(error);
    this.name = new.target.name;
  }
}
