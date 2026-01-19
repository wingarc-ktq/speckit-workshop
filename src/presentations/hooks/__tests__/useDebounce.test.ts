import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('初期値を即座に返す', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('値の変更を指定時間遅延させる', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 300 },
    });

    expect(result.current).toBe('initial');

    // 値を変更
    rerender({ value: 'updated', delay: 300 });

    // 即座にはまだ古い値
    expect(result.current).toBe('initial');

    // 遅延後に新しい値に更新される
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 400 },
    );
  });

  it('短時間に複数回変更しても最後の値だけが反映される', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    });

    // 短時間に複数回変更
    rerender({ value: 'first' });
    rerender({ value: 'second' });
    rerender({ value: 'third' });

    // 即座にはまだ初期値
    expect(result.current).toBe('initial');

    // 遅延後に最後の値だけが反映される
    await waitFor(
      () => {
        expect(result.current).toBe('third');
      },
      { timeout: 400 },
    );
  });

  it('異なる delay 値で動作する', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 100 },
    });

    rerender({ value: 'updated', delay: 100 });

    // 100ms後に更新される
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 200 },
    );
  });

  it('数値型でも動作する', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 0 },
    });

    rerender({ value: 42 });

    await waitFor(
      () => {
        expect(result.current).toBe(42);
      },
      { timeout: 400 },
    );
  });

  it('オブジェクト型でも動作する', async () => {
    const obj1 = { name: 'Alice' };
    const obj2 = { name: 'Bob' };

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: obj1 },
    });

    rerender({ value: obj2 });

    await waitFor(
      () => {
        expect(result.current).toBe(obj2);
      },
      { timeout: 400 },
    );
  });

  it('アンマウント時にタイマーがクリアされる', () => {
    vi.useFakeTimers();

    const { unmount, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });

    // タイマーをセット
    expect(vi.getTimerCount()).toBe(1);

    // アンマウント
    unmount();

    // タイマーがクリアされる
    expect(vi.getTimerCount()).toBe(0);

    vi.useRealTimers();
  });
});
