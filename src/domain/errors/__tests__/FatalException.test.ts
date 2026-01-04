import { FatalException } from '../FatalException';

describe('FatalException', () => {
  test.concurrent('正しいプロパティで例外が作成されること', () => {
    const source = { id: 1, name: 'test' };
    const message = '変換に失敗しました';

    const exception = new FatalException(message, source);

    expect(exception.message).toBe(message);
    expect(exception.name).toBe('FatalException');
    expect(exception.source).toEqual(source);
  });

  test.concurrent('Errorのインスタンスであること', () => {
    const exception = new FatalException('test', {});

    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(FatalException);
  });
});
