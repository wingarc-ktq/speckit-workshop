import { act, renderHook } from '@testing-library/react';

import { useDrawer } from '../useDrawer';

describe('useDrawer', () => {
  const defaultOptions = {
    minWidth: 180,
    maxWidth: 600,
    defaultWidth: 240,
  };

  test.concurrent('初期値が正しく設定される', () => {
    const { result } = renderHook(() => useDrawer(defaultOptions));

    expect(result.current.drawerOpen).toBe(true);
    expect(result.current.drawerWidth).toBe(240);
  });

  describe('toggleDrawer', () => {
    test.concurrent('ドロワーの開閉状態が切り替わる', () => {
      const { result } = renderHook(() => useDrawer(defaultOptions));

      // 初期状態は開いている
      expect(result.current.drawerOpen).toBe(true);

      // 閉じる
      act(() => {
        result.current.toggleDrawer();
      });
      expect(result.current.drawerOpen).toBe(false);

      // 開く
      act(() => {
        result.current.toggleDrawer();
      });
      expect(result.current.drawerOpen).toBe(true);
    });
  });

  describe('handleResizeDrawer', () => {
    test.concurrent('範囲内の値の時は幅が更新される', () => {
      const { result } = renderHook(() => useDrawer(defaultOptions));

      // 範囲内の値
      act(() => {
        result.current.handleResizeDrawer(300);
      });
      expect(result.current.drawerWidth).toBe(300);
    });

    test.concurrent('範囲外の値が無視される', () => {
      const { result } = renderHook(() => useDrawer(defaultOptions));

      const initialWidth = result.current.drawerWidth;

      // 最小値未満の場合
      act(() => {
        result.current.handleResizeDrawer(100);
      });
      expect(result.current.drawerWidth).toBe(initialWidth); // 変更されない

      // 最大値超過の場合
      act(() => {
        result.current.handleResizeDrawer(800);
      });
      expect(result.current.drawerWidth).toBe(initialWidth); // 変更されない
    });
    test.concurrent('minWidthとmaxWidthの境界値で正しく動作すること', () => {
      const { result } = renderHook(() => useDrawer(defaultOptions));

      // 最小値ちょうど
      act(() => {
        result.current.handleResizeDrawer(180);
      });
      expect(result.current.drawerWidth).toBe(180);

      // 最小値の境界値を超えた場合
      act(() => {
        result.current.handleResizeDrawer(179);
      });
      expect(result.current.drawerWidth).toBe(180); // 変更されない

      // 最大値ちょうど
      act(() => {
        result.current.handleResizeDrawer(600);
      });
      expect(result.current.drawerWidth).toBe(600);

      // 最大値の境界値を超えた場合
      act(() => {
        result.current.handleResizeDrawer(601);
      });
      expect(result.current.drawerWidth).toBe(600); // 変更されない
    });
  });

  test.concurrent('maxWidthが変更された時に現在の幅が調整されること', () => {
    const { result, rerender } = renderHook((props) => useDrawer(props), {
      initialProps: defaultOptions,
    });

    // 初期値を大きめに設定
    act(() => {
      result.current.handleResizeDrawer(500);
    });
    expect(result.current.drawerWidth).toBe(500);

    // maxWidthを小さくして再レンダリング
    rerender({
      ...defaultOptions,
      maxWidth: 400,
    });

    // 幅が自動的に調整されることを確認
    expect(result.current.drawerWidth).toBe(400);
  });
});
