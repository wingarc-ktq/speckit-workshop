import { renderHook, act } from '@testing-library/react';

import { useWindowSize } from '../useWindowSize';

// ウィンドウサイズをvi.stubGlobalでモック
const mockWindowSize = (width: number, height: number) => {
  vi.stubGlobal('innerWidth', width);
  vi.stubGlobal('innerHeight', height);
};

describe('useWindowSize', () => {
  beforeEach(() => {
    // デフォルトのウィンドウサイズを設定
    mockWindowSize(1024, 768);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test.concurrent('初期ウィンドウサイズが正しく取得されること', () => {
    const { result } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  test.concurrent('ウィンドウリサイズ時に値が更新されること', () => {
    const { result } = renderHook(() => useWindowSize());

    // 初期値
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);

    act(() => {
      // ウィンドウサイズを変更
      mockWindowSize(800, 600);
      window.dispatchEvent(new Event('resize'));
    });

    // 値が更新されることを確認
    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);
  });

  test.concurrent('複数回のリサイズで正しく動作すること', () => {
    const { result } = renderHook(() => useWindowSize());

    act(() => {
      // 1回目のリサイズ
      mockWindowSize(1200, 900);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.width).toBe(1200);
    expect(result.current.height).toBe(900);

    act(() => {
      // 2回目のリサイズ
      mockWindowSize(400, 300);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.width).toBe(400);
    expect(result.current.height).toBe(300);
  });

  test.concurrent('同じサイズでリサイズされても正しく動作すること', () => {
    const { result } = renderHook(() => useWindowSize());

    const initialWidth = result.current.width;
    const initialHeight = result.current.height;

    act(() => {
      // 同じサイズでリサイズイベントを発火
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(initialWidth);
    expect(result.current.height).toBe(initialHeight);
  });
});
