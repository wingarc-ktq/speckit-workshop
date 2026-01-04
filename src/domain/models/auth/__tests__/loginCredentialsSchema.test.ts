import { i18n } from '@/i18n/config';
import { loadZodLocale } from '@/i18n/zodLocale';

import { loginCredentialsSchema } from '../type';

describe('loginCredentialsSchema', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    await loadZodLocale('ja');
  });

  describe('userId フィールドのバリデーション', () => {
    describe('必須バリデーション', () => {
      test.concurrent('空文字の場合はエラーになること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: '',
          password: 'password123',
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('必須項目です');
      });

      test.concurrent('有効な文字列の場合は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'user@example.com',
          password: 'password123',
        });

        expect(result.success).toBe(true);
        expect(result.data?.userId).toBe('user@example.com');
      });
    });

    describe('メールアドレス形式', () => {
      test.concurrent('有効なメールアドレス形式の場合は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test.user+tag@example.co.jp',
          password: 'password123',
        });

        expect(result.success).toBe(true);
      });
    });

    describe('ユーザー名形式', () => {
      test.concurrent('英数字のユーザー名は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'testuser123',
          password: 'password123',
        });

        expect(result.success).toBe(true);
      });

      test.concurrent('アンダースコアを含むユーザー名は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test_user',
          password: 'password123',
        });

        expect(result.success).toBe(true);
      });

      test.concurrent('ハイフンを含むユーザー名は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test-user',
          password: 'password123',
        });

        expect(result.success).toBe(true);
      });
    });

    describe('エッジケース', () => {
      test.concurrent('1文字のuserIdは成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'a',
          password: 'password123',
        });

        expect(result.success).toBe(true);
      });

      test.concurrent('長いuserIdでも成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'a'.repeat(100),
          password: 'password123',
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe('password フィールドのバリデーション', () => {
    describe('必須バリデーション', () => {
      test.concurrent('空文字の場合はエラーになること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test@example.com',
          password: '',
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('必須項目です');
      });

      test.concurrent('有効なパスワードの場合は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test@example.com',
          password: 'password123',
        });

        expect(result.success).toBe(true);
      });
    });

    describe('最小文字数バリデーション（境界値テスト）', () => {
      test.concurrent('7文字の場合はエラーになること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test@example.com',
          password: 'pass123',
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          '8文字以上で入力してください'
        );
      });

      test.concurrent('8文字ちょうどの場合は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test@example.com',
          password: 'pass1234',
        });

        expect(result.success).toBe(true);
      });
    });

    describe('最大文字数バリデーション（境界値テスト）', () => {
      test.concurrent('36文字ちょうどの場合は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test@example.com',
          password: 'a'.repeat(36),
        });

        expect(result.success).toBe(true);
      });

      test.concurrent('37文字の場合はエラーになること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test@example.com',
          password: 'a'.repeat(37),
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          '36文字以内で入力してください'
        );
      });
    });

    describe('特殊文字を含むパスワード', () => {
      test.concurrent('記号を含むパスワードは成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test@example.com',
          password: 'P@ssw0rd!',
        });

        expect(result.success).toBe(true);
      });

      test.concurrent('スペースを含むパスワードは成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test@example.com',
          password: 'pass word 123',
        });

        expect(result.success).toBe(true);
      });

      test.concurrent('日本語を含むパスワードは成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          userId: 'test@example.com',
          password: 'パスワード123',
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe('rememberMe フィールドのバリデーション', () => {
    test.concurrent('trueの場合は成功すること', () => {
      const result = loginCredentialsSchema.safeParse({
        userId: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.rememberMe).toBe(true);
    });

    test.concurrent('falseの場合は成功すること', () => {
      const result = loginCredentialsSchema.safeParse({
        userId: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });

      expect(result.success).toBe(true);
      expect(result.data?.rememberMe).toBe(false);
    });

    test.concurrent('省略した場合は成功すること', () => {
      const result = loginCredentialsSchema.safeParse({
        userId: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.rememberMe).toBeUndefined();
    });

    test.concurrent('undefinedの場合は成功すること', () => {
      const result = loginCredentialsSchema.safeParse({
        userId: 'test@example.com',
        password: 'password123',
        rememberMe: undefined,
      });

      expect(result.success).toBe(true);
      expect(result.data?.rememberMe).toBeUndefined();
    });
  });
});
