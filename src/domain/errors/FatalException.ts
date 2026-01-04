import { ApplicationException } from './ApplicationException';

/**
 * 致命的エラー
 * 不正なデータ等の影響で画面からの復旧が不可能な場合に使用
 */
export class FatalException extends ApplicationException {
  readonly name: string;
  readonly source: unknown;

  constructor(message: string, source: unknown) {
    super(message);
    this.name = new.target.name;
    this.source = source;
  }
}
