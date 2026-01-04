import { ApplicationException } from '../ApplicationException';

describe('ApplicationException', () => {
  test.concurrent('エラーメッセージとnameが正しく設定されること', () => {
    const message = 'テストエラー';
    const error = new ApplicationException(message);

    expect(error.message).toBe(message);
    expect(error.name).toBe('ApplicationException');
    expect(error instanceof Error).toBe(true);
  });
});
