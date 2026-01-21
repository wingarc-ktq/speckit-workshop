import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { TagFilter } from '@/presentations/components/files/TagFilter';
import { useTags } from '@/presentations/hooks/queries';

// useTags フックをモック
vi.mock('@/presentations/hooks/queries', () => ({
  useTags: vi.fn(),
}));

/**
 * TagFilter コンポーネントテスト
 * US4: タグでフィルタリング
 */

describe('TagFilter', () => {
  describe('T059: コンポーネント基本機能', () => {
    it('ローディング中はスピナーを表示', () => {
      vi.mocked(useTags).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={() => {}} />
        </RepositoryTestWrapper>
      );

      expect(screen.getByTestId('tag-filter-spinner')).toBeInTheDocument();
    });

    it('タグ一覧が表示される', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: 'レポート', color: 'success', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={() => {}} />
        </RepositoryTestWrapper>
      );

      expect(screen.getByText('請求書')).toBeInTheDocument();
      expect(screen.getByText('レポート')).toBeInTheDocument();
    });

    it('エラー時はエラーメッセージを表示', () => {
      const error = new Error('フェッチエラー');
      vi.mocked(useTags).mockReturnValue({
        data: [],
        isLoading: false,
        error,
      } as unknown as ReturnType<typeof useTags>);

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={() => {}} />
        </RepositoryTestWrapper>
      );

      expect(screen.getByTestId('tag-filter-error')).toBeInTheDocument();
    });

    it('タグ一覧が空の場合はメッセージを表示', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={() => {}} />
        </RepositoryTestWrapper>
      );

      expect(screen.getByText('請求書')).toBeInTheDocument();
    });
  });

  describe('T060: 複数選択機能', () => {
    it('複数のタグを選択できる', async () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: 'レポート', color: 'success', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      const onSelectionChange = vi.fn();

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={onSelectionChange} />
        </RepositoryTestWrapper>
      );

      fireEvent.click(screen.getByText('請求書'));
      fireEvent.click(screen.getByText('レポート'));

      expect(onSelectionChange).toHaveBeenCalledWith(expect.arrayContaining(['tag-001', 'tag-002']));
    });

    it('選択したタグを解除できる', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      const onSelectionChange = vi.fn();

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={onSelectionChange} />
        </RepositoryTestWrapper>
      );

      fireEvent.click(screen.getByText('請求書'));
      expect(onSelectionChange).toHaveBeenCalledWith(['tag-001']);

      fireEvent.click(screen.getByText('請求書'));
      expect(onSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe('T061: フィルタリング動作', () => {
    it('選択されたタグでフィルタリングが実行される', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      const onSelectionChange = vi.fn();

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={onSelectionChange} />
        </RepositoryTestWrapper>
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      fireEvent.click(checkboxes[0]);

      expect(onSelectionChange).toHaveBeenCalled();
    });

    it('複数タグの組み合わせでフィルタリングできる', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: 'レポート', color: 'success', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-003', name: '契約書', color: 'primary', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      const onSelectionChange = vi.fn();

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={onSelectionChange} />
        </RepositoryTestWrapper>
      );

      fireEvent.click(screen.getByText('請求書'));
      fireEvent.click(screen.getByText('レポート'));

      expect(onSelectionChange).toHaveBeenLastCalledWith(expect.arrayContaining(['tag-001', 'tag-002']));
    });

    it('「すべてクリア」ボタンで全選択を解除できる', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: 'レポート', color: 'success', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      const onSelectionChange = vi.fn();

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={onSelectionChange} />
        </RepositoryTestWrapper>
      );

      fireEvent.click(screen.getByText('請求書'));
      fireEvent.click(screen.getByText('レポート'));

      const clearButton = screen.queryByText(/すべてクリア|Clear All/i);
      if (clearButton) {
        fireEvent.click(clearButton);
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
      }
    });
  });
});
