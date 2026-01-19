import { useEffect, useState } from 'react';

/**
 * デバウンスフック
 * 値の変更を遅延させて、頻繁な更新を防ぐ
 *
 * @template T - デバウンス対象の値の型
 * @param value - デバウンス対象の値
 * @param delay - 遅延時間（ミリ秒）
 * @returns デバウンスされた値
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 遅延後に値を更新するタイマーをセット
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // クリーンアップ関数：次の effect が実行される前にタイマーをクリア
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
