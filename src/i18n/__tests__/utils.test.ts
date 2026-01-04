import { createKeys } from '../utils';

describe('createKeys', () => {
  describe('基本的なネスト構造の変換', () => {
    test.concurrent(
      '2階層のネストオブジェクトをドット記法に変換する',
      async () => {
        const input = {
          auth: {
            login: 'ログイン',
            logout: 'ログアウト',
          },
          home: {
            title: 'ホーム',
          },
        };

        const result = createKeys(input);

        expect(result.auth.login).toBe('auth.login');
        expect(result.auth.logout).toBe('auth.logout');
        expect(result.home.title).toBe('home.title');
      }
    );

    test.concurrent('4階層の深いネストでも正しく変換する', async () => {
      const input = {
        level1: {
          level2: {
            level3: {
              key: 'value',
            },
          },
        },
      };

      const result = createKeys(input);

      expect(result.level1.level2.level3.key).toBe('level1.level2.level3.key');
    });

    test.concurrent(
      'フラットなオブジェクトはキー名をそのまま文字列にする',
      async () => {
        const input = {
          key1: 'value1',
          key2: 'value2',
          key3: 'value3',
        };

        const result = createKeys(input);

        expect(result.key1).toBe('key1');
        expect(result.key2).toBe('key2');
        expect(result.key3).toBe('key3');
      }
    );

    test.concurrent('空のオブジェクトは空のオブジェクトを返す', async () => {
      const input = {};

      const result = createKeys(input);

      expect(result).toEqual({});
    });
  });

  describe('特殊な値の処理', () => {
    test.concurrent('null値はキー名を文字列にする', async () => {
      const input = {
        nullKey: null,
      };

      const result = createKeys(input);

      expect(result.nullKey).toBe('nullKey');
    });

    test.concurrent('undefined値はキー名を文字列にする', async () => {
      const input = {
        definedKey: 'value',
        undefinedKey: undefined,
        nested: {
          subKey: 'subValue',
          undefinedSub: undefined,
        },
      };

      const result = createKeys(input);

      expect(result.definedKey).toBe('definedKey');
      expect(result.undefinedKey).toBe('undefinedKey');
      expect(result.nested.subKey).toBe('nested.subKey');
      expect(result.nested.undefinedSub).toBe('nested.undefinedSub');
    });

    test.concurrent('配列は再帰展開せずキー名を文字列にする', async () => {
      const input = {
        items: ['item1', 'item2'],
        config: {
          list: ['a', 'b', 'c'],
        },
      };

      const result = createKeys(input);

      expect(result.items).toBe('items');
      expect(result.config.list).toBe('config.list');
    });

    test.concurrent(
      'プリミティブ型（文字列・数値・真偽値）はキー名を文字列にする',
      async () => {
        const input = {
          string: 'text',
          number: 42,
          boolean: true,
          nested: {
            value: 'nested value',
          },
        };

        const result = createKeys(input);

        expect(result.string).toBe('string');
        expect(result.number).toBe('number');
        expect(result.boolean).toBe('boolean');
        expect(result.nested.value).toBe('nested.value');
      }
    );
  });

  describe('実践的なユースケース', () => {
    test.concurrent(
      '複雑な4階層ネスト構造でも正しく変換する（i18n翻訳ファイルの例）',
      async () => {
        const input = {
          auth: {
            login: {
              form: {
                username: 'ユーザー名',
                password: 'パスワード',
                submit: 'ログイン',
              },
              errors: {
                invalid: '無効な認証情報',
                required: '必須項目です',
              },
            },
            logout: 'ログアウト',
          },
          pages: {
            home: {
              title: 'ホーム',
              sections: {
                overview: '概要',
                stats: '統計',
              },
            },
          },
        };

        const result = createKeys(input);

        expect(result.auth.login.form.username).toBe(
          'auth.login.form.username'
        );
        expect(result.auth.login.form.password).toBe(
          'auth.login.form.password'
        );
        expect(result.auth.login.form.submit).toBe('auth.login.form.submit');
        expect(result.auth.login.errors.invalid).toBe(
          'auth.login.errors.invalid'
        );
        expect(result.auth.login.errors.required).toBe(
          'auth.login.errors.required'
        );
        expect(result.auth.logout).toBe('auth.logout');
        expect(result.pages.home.title).toBe('pages.home.title');
        expect(result.pages.home.sections.overview).toBe(
          'pages.home.sections.overview'
        );
        expect(result.pages.home.sections.stats).toBe(
          'pages.home.sections.stats'
        );
      }
    );
  });

  describe('特殊文字の処理', () => {
    test.concurrent(
      '特殊文字（ハイフン・アンダースコア・ドット）を含むキー名を正しく処理する',
      async () => {
        const input = {
          'key-with-dash': 'value1',
          key_with_underscore: 'value2',
          'key.with.dots': 'value3',
          nested: {
            'special-key': 'nested value',
          },
        };

        const result = createKeys(input);

        expect(result['key-with-dash']).toBe('key-with-dash');
        expect(result['key_with_underscore']).toBe('key_with_underscore');
        expect(result['key.with.dots']).toBe('key.with.dots');
        expect(result.nested['special-key']).toBe('nested.special-key');
      }
    );
  });
});
