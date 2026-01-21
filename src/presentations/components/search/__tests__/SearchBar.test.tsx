import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';

import { SearchBar } from '../SearchBar';

/**
 * SearchBar コンポーネントテスト
 * US3: キーワード検索
 */

describe('SearchBar', () => {
  // T046: SearchBar コンポーネントテスト
  describe('T046: コンポーネント基本機能', () => {
    test('SearchBar がレンダリングされる', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      const searchInput = screen.getByPlaceholderText('検索...');
      expect(searchInput).toBeInTheDocument();
    });

    test('入力値が変更されると onSearch コールバックが呼ばれる', async () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      const searchInput = screen.getByPlaceholderText('検索...');
      
      // ユーザー入力をシミュレート
      await userEvent.type(searchInput, 'test');

      // デバウンス後に呼び出されることを確認
      await waitFor(
        () => {
          expect(mockOnSearch).toHaveBeenCalledWith('test');
        },
        { timeout: 500 }
      );
    });

    test('複数の入力変更がある場合、最終的な値だけで onSearch が呼ばれる', async () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      const searchInput = screen.getByPlaceholderText('検索...');
      
      // 複数の入力をシミュレート (デバウンス対象)
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 't', { delay: 10 });
      await userEvent.type(searchInput, 'e', { delay: 10 });
      await userEvent.type(searchInput, 's', { delay: 10 });
      await userEvent.type(searchInput, 't', { delay: 10 });

      // デバウンス完了待機
      await waitFor(
        () => {
          // 複数回呼ばれるが、最終的に 'test' で確定
          const lastCall = mockOnSearch.mock.calls[mockOnSearch.mock.calls.length - 1];
          expect(lastCall[0]).toBe('test');
        },
        { timeout: 500 }
      );
    });
  });

  // T047: デバウンステスト
  describe('T047: デバウンス 300ms', () => {
    test('入力後 300ms 以内の変更はデバウンスされる', async () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      const searchInput = screen.getByPlaceholderText('検索...');
      
      // 最初の入力
      await userEvent.type(searchInput, 'a');
      expect(mockOnSearch).not.toHaveBeenCalled();

      // 200ms 後の入力 (300ms 以内なのでデバウンス継続)
      await userEvent.type(searchInput, 'b');
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    test('入力後 300ms 以上待つと onSearch が呼ばれる', async () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      const searchInput = screen.getByPlaceholderText('検索...');
      
      await userEvent.type(searchInput, 'test');

      // 300ms 待機
      await waitFor(
        () => {
          expect(mockOnSearch).toHaveBeenCalledWith('test');
        },
        { timeout: 400 }
      );
    });

    test('デバウンス中に入力が続く場合、タイマーがリセットされる', async () => {
      const mockOnSearch = vi.fn();
      vi.useFakeTimers();

      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      const searchInput = screen.getByPlaceholderText('検索...');
      
      // 最初の入力
      fireEvent.change(searchInput, { target: { value: 't' } });
      vi.advanceTimersByTime(100);

      // 100ms 後にさらに入力 (タイマーリセット)
      fireEvent.change(searchInput, { target: { value: 'te' } });
      vi.advanceTimersByTime(100);

      // まだ 200ms しか経過していないので呼び出されない
      expect(mockOnSearch).not.toHaveBeenCalled();

      // さらに 200ms 待つ (合計 400ms)
      vi.advanceTimersByTime(200);

      // この時点で onSearch が呼ばれる
      expect(mockOnSearch).toHaveBeenCalledWith('te');

      vi.useRealTimers();
    });
  });

  describe('T046: クリア機能', () => {
    test('クリアボタンが表示される (入力があるとき)', async () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      const searchInput = screen.getByPlaceholderText('検索...');
      
      // 入力
      await userEvent.type(searchInput, 'test');

      // クリアボタンが表示される
      const clearButton = screen.getByRole('button', { name: /クリア|clear|✕|×/i });
      await waitFor(() => {
        expect(clearButton).toBeVisible();
      });
    });

    test('クリアボタンをクリックすると入力が空になり、onSearch("") が呼ばれる', async () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      const searchInput = screen.getByPlaceholderText('検索...') as HTMLInputElement;
      
      // 入力
      await userEvent.type(searchInput, 'test');
      await waitFor(() => expect(mockOnSearch).toHaveBeenCalled());

      mockOnSearch.mockClear();

      // クリアボタンをクリック
      const clearButton = screen.getByRole('button', { name: /クリア|clear|✕|×/i });
      await userEvent.click(clearButton);

      // 入力が空になる
      expect(searchInput.value).toBe('');

      // デバウンス後に onSearch('') が呼ばれる
      await waitFor(
        () => {
          expect(mockOnSearch).toHaveBeenCalledWith('');
        },
        { timeout: 400 }
      );
    });

    test('クリアボタンは入力がないとき表示されない', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      // 入力がないので、クリアボタンは表示されないか非表示
      const clearButton = screen.queryByRole('button', { name: /クリア|clear|✕|×/i });
      
      if (clearButton) {
        expect(clearButton).not.toBeVisible();
      }
    });
  });

  describe('T046: UI 要素', () => {
    test('検索アイコンが表示される', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      // Material-UI の SearchIcon が present
      const searchIcon = document.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    test('プレースホルダーテキストが正しく表示される', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="文書を検索..." />);

      const searchInput = screen.getByPlaceholderText('文書を検索...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('T046-T047: エッジケース', () => {
    test('空白のみの入力', async () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      const searchInput = screen.getByPlaceholderText('検索...');
      
      await userEvent.type(searchInput, '   ');

      await waitFor(
        () => {
          expect(mockOnSearch).toHaveBeenCalledWith('   ');
        },
        { timeout: 400 }
      );
    });

    test('特殊文字の入力', async () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      const searchInput = screen.getByPlaceholderText('検索...');
      
      await userEvent.type(searchInput, '田中商事_2024@01');

      await waitFor(
        () => {
          expect(mockOnSearch).toHaveBeenCalledWith('田中商事_2024@01');
        },
        { timeout: 400 }
      );
    });

    test('非常に長いテキストの入力', async () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} placeholder="検索..." />);

      const searchInput = screen.getByPlaceholderText('検索...');
      const longText = 'a'.repeat(100);
      
      await userEvent.type(searchInput, longText);

      await waitFor(
        () => {
          expect(mockOnSearch).toHaveBeenCalledWith(longText);
        },
        { timeout: 400 }
      );
    });
  });
});
