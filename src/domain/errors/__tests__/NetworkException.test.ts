import { ApplicationException } from '../ApplicationException';
import { NetworkException } from '../NetworkException';

describe('NetworkException', () => {
  test.concurrent('ネットワークエラーメッセージが正しく設定されること', () => {
    const message = 'ネットワーク接続に失敗しました';
    const error = new NetworkException(message);

    expect(error.message).toBe(message);
    expect(error.name).toBe('NetworkException');
    expect(error instanceof ApplicationException).toBe(true);
  });
});
