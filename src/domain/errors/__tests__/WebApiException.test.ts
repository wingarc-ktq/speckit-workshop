import { WebApiException } from '../WebApiException';

describe('WebApiException', () => {
  test.concurrent('基本的なプロパティが正しく設定されること', () => {
    const statusCode = 404;
    const statusText = 'Not Found';
    const data = { error: 'test' };
    const error = new WebApiException(statusCode, statusText, data);

    expect(error.statusCode).toBe(statusCode);
    expect(error.statusText).toBe(statusText);
    expect(error.data).toBe(data);
    expect(error.message).toBe(statusText);
    expect(error.name).toBe('WebApiException');
  });

  test.concurrent(
    'オプショナルパラメータなしでインスタンス化できること',
    () => {
      const error = new WebApiException(500, 'Internal Server Error');

      expect(error.statusCode).toBe(500);
      expect(error.statusText).toBe('Internal Server Error');
      expect(error.data).toBeNull();
    }
  );
});
