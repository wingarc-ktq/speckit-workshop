type DeepKeys<T, Prefix extends string = ''> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: T[K] extends Record<string, unknown>
          ? DeepKeys<
              T[K],
              `${Prefix}${Prefix extends '' ? '' : '.'}${K & string}`
            >
          : `${Prefix}${Prefix extends '' ? '' : '.'}${K & string}`;
      }
    : never;

/**
 * オブジェクトのキーをドット記法の文字列に変換する
 * @param obj 変換対象のオブジェクト
 * @param prefix 現在のネスト階層のプレフィックス
 * @returns 変換後のオブジェクト
 */
export function createKeys<T extends Record<string, unknown>>(
  obj: T,
  prefix = ''
): DeepKeys<T> {
  const result = {} as DeepKeys<T>;

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = createKeys(
        value as Record<string, unknown>,
        fullKey
      );
    } else {
      (result as Record<string, unknown>)[key] = fullKey;
    }
  });

  return result;
}
