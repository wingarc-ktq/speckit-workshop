import { ApplicationException } from './ApplicationException';

/**
 * WEB API実行エラー
 * @param statusCode HTTPステータスコード
 * @param statusText HTTPステータステキスト
 * @param data エラーデータ
 */
export class WebApiException extends ApplicationException {
  readonly statusCode: number;
  readonly statusText: string;
  readonly data: unknown;

  constructor(statusCode: number, statusText: string, data: unknown = null) {
    super(statusText);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.data = data;
  }
}
