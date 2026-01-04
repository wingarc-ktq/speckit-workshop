import { renderHook, act } from '@testing-library/react';

import { usePasswordVisibility } from '../usePasswordVisibility';

describe('usePasswordVisibility', () => {
  const hook = (initialValue?: boolean) => {
    return renderHook(() => usePasswordVisibility(initialValue));
  };
  describe('初期状態', () => {
    test('デフォルトでshowPasswordがfalseになること', () => {
      const { result } = hook();

      expect(result.current.showPassword).toBe(false);
    });

    test('初期値を指定した場合、その値が設定されること', () => {
      const { result } = hook(true);

      expect(result.current.showPassword).toBe(true);
    });
  });

  describe('togglePasswordVisibility', () => {
    test('togglePasswordVisibilityを呼び出すとshowPasswordが切り替わること', () => {
      const { result } = hook();

      expect(result.current.showPassword).toBe(false);

      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.showPassword).toBe(true);

      act(() => {
        result.current.togglePasswordVisibility();
      });

      expect(result.current.showPassword).toBe(false);
    });

    test('複数回切り替えても正常に動作すること', () => {
      const { result } = hook();

      // 3回切り替え
      act(() => {
        result.current.togglePasswordVisibility();
        result.current.togglePasswordVisibility();
        result.current.togglePasswordVisibility();
      });

      expect(result.current.showPassword).toBe(true);
    });
  });
});
