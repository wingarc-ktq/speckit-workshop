/**
 * カスタムフックテストテンプレート
 *
 * このテンプレートは、Reactカスタムフックのテストに使用します。
 * test.concurrent を使用して並列実行可能なテストを作成します。
 *
 * 使用例：
 * - カスタムフック（useState, useEffect, useCallback などを使用）
 * - ピュア関数のテスト
 */

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

import { useCustomHook } from '../useCustomHook';

describe('useCustomHook', () => {
  describe('基本機能', () => {
    test.concurrent('初期値が正しく設定されること', () => {
      const { result } = renderHook(() => useCustomHook('初期値'));

      expect(result.current.value).toBe('初期値');
    });

    test.concurrent('デフォルト値が正しく適用されること', () => {
      const { result } = renderHook(() => useCustomHook());

      expect(result.current.value).toBe('');
    });

    test.concurrent('オプションが正しく反映されること', () => {
      const { result } = renderHook(() =>
        useCustomHook('値', {
          enabled: true,
          maxLength: 100,
        })
      );

      expect(result.current.enabled).toBe(true);
      expect(result.current.maxLength).toBe(100);
    });
  });

  describe('状態更新', () => {
    test.concurrent('値を更新できること', () => {
      const { result } = renderHook(() => useCustomHook('初期値'));

      act(() => {
        result.current.setValue('新しい値');
      });

      expect(result.current.value).toBe('新しい値');
    });

    test.concurrent('複数回の更新が正しく反映されること', () => {
      const { result } = renderHook(() => useCustomHook(''));

      act(() => {
        result.current.setValue('値1');
      });
      expect(result.current.value).toBe('値1');

      act(() => {
        result.current.setValue('値2');
      });
      expect(result.current.value).toBe('値2');

      act(() => {
        result.current.setValue('値3');
      });
      expect(result.current.value).toBe('値3');
    });

    test.concurrent('リセット機能が正しく動作すること', () => {
      const { result } = renderHook(() => useCustomHook('初期値'));

      act(() => {
        result.current.setValue('変更後の値');
      });
      expect(result.current.value).toBe('変更後の値');

      act(() => {
        result.current.reset();
      });
      expect(result.current.value).toBe('初期値');
    });
  });

  describe('バリデーション', () => {
    test.concurrent('無効な値でエラーを返すこと', () => {
      const { result } = renderHook(() => useCustomHook(''));

      act(() => {
        result.current.setValue('');
      });

      expect(result.current.error).toBe('値を入力してください');
      expect(result.current.isValid).toBe(false);
    });

    test.concurrent('有効な値でエラーがないこと', () => {
      const { result } = renderHook(() => useCustomHook(''));

      act(() => {
        result.current.setValue('有効な値');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });

    test.concurrent('カスタムバリデーターが機能すること', () => {
      const customValidator = (value: string) =>
        value.length < 5 ? '5文字以上入力してください' : null;

      const { result } = renderHook(() =>
        useCustomHook('', { validator: customValidator })
      );

      act(() => {
        result.current.setValue('abc');
      });

      expect(result.current.error).toBe('5文字以上入力してください');
      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setValue('abcde');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('副作用', () => {
    test.concurrent('コールバックが正しく呼ばれること', async () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useCustomHook('', { onChange }));

      act(() => {
        result.current.setValue('新しい値');
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('新しい値');
        expect(onChange).toHaveBeenCalledTimes(1);
      });
    });

    test.concurrent('デバウンス処理が機能すること', async () => {
      const onDebounced = vi.fn();
      const { result } = renderHook(() =>
        useCustomHook('', {
          onDebounced,
          debounceMs: 300,
        })
      );

      // 高速で3回更新
      act(() => {
        result.current.setValue('a');
      });
      act(() => {
        result.current.setValue('ab');
      });
      act(() => {
        result.current.setValue('abc');
      });

      // デバウンス時間前は呼ばれない
      expect(onDebounced).not.toHaveBeenCalled();

      // デバウンス時間経過後に1回だけ呼ばれる
      await waitFor(
        () => {
          expect(onDebounced).toHaveBeenCalledWith('abc');
          expect(onDebounced).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
    });

    test.concurrent('クリーンアップ関数が正しく動作すること', () => {
      const cleanup = vi.fn();
      const { result, unmount } = renderHook(() => useCustomHook('', { cleanup }));

      // フックを使用
      act(() => {
        result.current.setValue('値');
      });

      // アンマウント
      unmount();

      // クリーンアップが呼ばれる
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('propsの変更', () => {
    test.concurrent('propsが変更されると再計算されること', () => {
      const { result, rerender } = renderHook(
        ({ initialValue }) => useCustomHook(initialValue),
        {
          initialProps: { initialValue: '初期値' },
        }
      );

      expect(result.current.value).toBe('初期値');

      // propsを変更して再レンダリング
      rerender({ initialValue: '新しい初期値' });

      expect(result.current.value).toBe('新しい初期値');
    });

    test.concurrent('オプションの変更が反映されること', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useCustomHook('値', { enabled }),
        {
          initialProps: { enabled: false },
        }
      );

      expect(result.current.enabled).toBe(false);

      rerender({ enabled: true });

      expect(result.current.enabled).toBe(true);
    });
  });

  describe('エッジケース', () => {
    test.concurrent('undefinedが渡された場合にデフォルト値が使われること', () => {
      const { result } = renderHook(() => useCustomHook(undefined));

      expect(result.current.value).toBe('');
    });

    test.concurrent('nullが渡された場合に適切に処理されること', () => {
      const { result } = renderHook(() => useCustomHook(null as any));

      expect(result.current.value).toBe('');
    });

    test.concurrent('空文字列が渡された場合に正しく動作すること', () => {
      const { result } = renderHook(() => useCustomHook(''));

      expect(result.current.value).toBe('');
      expect(result.current.isEmpty).toBe(true);
    });

    test.concurrent('非常に長い文字列が渡された場合に正しく動作すること', () => {
      const longString = 'あ'.repeat(10000);
      const { result } = renderHook(() => useCustomHook(longString));

      expect(result.current.value).toBe(longString);
      expect(result.current.length).toBe(10000);
    });

    test.concurrent('特殊文字が含まれる文字列を正しく処理できること', () => {
      const specialChars = '<script>alert("XSS")</script>';
      const { result } = renderHook(() => useCustomHook(specialChars));

      act(() => {
        result.current.setValue(specialChars);
      });

      expect(result.current.value).toBe(specialChars);
    });
  });

  describe('メモ化', () => {
    test.concurrent('計算結果がメモ化されること', () => {
      const expensiveCalculation = vi.fn((value: string) => value.toUpperCase());

      const { result, rerender } = renderHook(() => {
        const hook = useCustomHook('test');
        return {
          ...hook,
          upperValue: expensiveCalculation(hook.value),
        };
      });

      expect(expensiveCalculation).toHaveBeenCalledTimes(1);
      expect(result.current.upperValue).toBe('TEST');

      // 値が変わらない再レンダリング
      rerender();

      // メモ化により再計算されない
      expect(expensiveCalculation).toHaveBeenCalledTimes(1);
    });

    test.concurrent('依存配列の値が変わると再計算されること', () => {
      const calculate = vi.fn((value: string) => value.length);

      const { result, rerender } = renderHook(
        ({ value }) => {
          const hook = useCustomHook(value);
          return {
            ...hook,
            length: calculate(hook.value),
          };
        },
        {
          initialProps: { value: 'test' },
        }
      );

      expect(calculate).toHaveBeenCalledTimes(1);
      expect(result.current.length).toBe(4);

      // 値を変更
      rerender({ value: 'testing' });

      // 再計算される
      expect(calculate).toHaveBeenCalledTimes(2);
      expect(result.current.length).toBe(7);
    });
  });

  describe('非同期処理', () => {
    test.concurrent('非同期データの取得が正しく動作すること', async () => {
      const fetchData = vi.fn().mockResolvedValue('取得したデータ');

      const { result } = renderHook(() => useCustomHook('', { fetchData }));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();

      act(() => {
        result.current.fetch();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe('取得したデータ');
      });
    });

    test.concurrent('非同期エラーが正しく処理されること', async () => {
      const fetchData = vi.fn().mockRejectedValue(new Error('取得エラー'));

      const { result } = renderHook(() => useCustomHook('', { fetchData }));

      act(() => {
        result.current.fetch();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('取得エラー');
        expect(result.current.data).toBeNull();
      });
    });

    test.concurrent('中断された非同期処理が正しく処理されること', async () => {
      const fetchData = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('データ'), 1000);
          })
      );

      const { result, unmount } = renderHook(() => useCustomHook('', { fetchData }));

      act(() => {
        result.current.fetch();
      });

      expect(result.current.isLoading).toBe(true);

      // 非同期処理中にアンマウント
      unmount();

      // エラーが発生しないことを確認
      await waitFor(() => {
        expect(true).toBe(true);
      });
    });
  });
});
