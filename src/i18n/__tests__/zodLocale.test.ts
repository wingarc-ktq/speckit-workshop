import * as z from 'zod';

import { loadZodLocale } from '../zodLocale';

// ライブラリの機能はテスト不要なため、zodのconfigメソッドをモック化
vi.mock('zod', async () => {
  const actual = await vi.importActual('zod');
  return {
    ...actual,
    config: vi.fn(),
  };
});

// 動的インポートをモック化
vi.mock('zod/v4/locales/ja.js', () => ({
  default: vi.fn(() => ({
    locale: 'ja',
    errors: {
      too_small: '短すぎます',
      invalid_string: '無効な文字列です',
    },
  })),
}));

vi.mock('zod/v4/locales/en.js', () => ({
  default: vi.fn(() => ({
    locale: 'en',
    errors: {
      too_small: 'Too small',
      invalid_string: 'Invalid string',
    },
  })),
}));

describe('loadZodLocale', () => {
  const mockZodConfig = vi.mocked(z.config);

  test('日本語ロケール("ja")を正しく読み込む', async () => {
    await loadZodLocale('ja');

    expect(mockZodConfig).toHaveBeenCalledWith({
      locale: 'ja',
      errors: {
        too_small: '短すぎます',
        invalid_string: '無効な文字列です',
      },
    });
    expect(mockZodConfig).toHaveBeenCalledTimes(1);
  });

  test('英語ロケール("en")を正しく読み込む', async () => {
    await loadZodLocale('en');

    expect(mockZodConfig).toHaveBeenCalledWith({
      locale: 'en',
      errors: {
        too_small: 'Too small',
        invalid_string: 'Invalid string',
      },
    });
    expect(mockZodConfig).toHaveBeenCalledTimes(1);
  });

  test('英語ロケール("en-US")をenとして読み込む', async () => {
    await loadZodLocale('en-US');

    expect(mockZodConfig).toHaveBeenCalledWith({
      locale: 'en',
      errors: {
        too_small: 'Too small',
        invalid_string: 'Invalid string',
      },
    });
    expect(mockZodConfig).toHaveBeenCalledTimes(1);
  });

  test('未対応のロケールはデフォルト（日本語）にフォールバックする', async () => {
    await loadZodLocale('fr'); // 今後対応した時は変更する

    expect(mockZodConfig).toHaveBeenCalledWith({
      locale: 'ja',
      errors: {
        too_small: '短すぎます',
        invalid_string: '無効な文字列です',
      },
    });
    expect(mockZodConfig).toHaveBeenCalledTimes(1);
  });

  test('空文字列はデフォルト（日本語）にフォールバックする', async () => {
    await loadZodLocale('');

    expect(mockZodConfig).toHaveBeenCalledWith({
      locale: 'ja',
      errors: {
        too_small: '短すぎます',
        invalid_string: '無効な文字列です',
      },
    });
    expect(mockZodConfig).toHaveBeenCalledTimes(1);
  });

  test('nullish値はデフォルト（日本語）にフォールバックする', async () => {
    // @ts-expect-error Testing runtime behavior with invalid input
    await loadZodLocale(null);

    expect(mockZodConfig).toHaveBeenCalledWith({
      locale: 'ja',
      errors: {
        too_small: '短すぎます',
        invalid_string: '無効な文字列です',
      },
    });
    expect(mockZodConfig).toHaveBeenCalledTimes(1);
  });

  test('複数回呼び出された場合、最後の設定が適用される', async () => {
    await loadZodLocale('ja');
    await loadZodLocale('en');

    expect(mockZodConfig).toHaveBeenCalledTimes(2);
    expect(mockZodConfig).toHaveBeenNthCalledWith(1, {
      locale: 'ja',
      errors: {
        too_small: '短すぎます',
        invalid_string: '無効な文字列です',
      },
    });
    expect(mockZodConfig).toHaveBeenNthCalledWith(2, {
      locale: 'en',
      errors: {
        too_small: 'Too small',
        invalid_string: 'Invalid string',
      },
    });
  });
});
