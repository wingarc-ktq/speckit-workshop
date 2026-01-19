import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagFilter } from '@/presentations/components/files/TagFilter';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';

// useTags フックをモック
vi.mock('@/presentations/hooks/queries', () => ({
  useTags: vi.fn(),
}));

import { useTags } from '@/presentations/hooks/queries';

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
      } as any);

      render(
        <RepositoryTestWrapper>
          <TagFilter />
        </RepositoryTestWrapper>
      );

      expect(screen.getByText('タグ')).toBeInTheDocument();
      // CircularProgress が存在することを確認
      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });

    it('タグ一覧が表示される', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: '契約書', color: 'success', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as any);

      render(
        <RepositoryTestWrapper>
          <TagFilter />
        </RepositoryTestWrapper>
      );

      expect(screen.getByText('請求書')).toBeInTheDocument();
      expect(screen.getByText('契約書')).toBeInTheDocument();
    });

    it('タグが0件の場合は「タグなし」と表示', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      render(
        <RepositoryTestWrapper>
          <TagFilter />
        </RepositoryTestWrapper>
      );

      expect(screen.getByText('タグなし')).toBeInTheDocument();
    });
  });

  describe('T059: タグ選択状態管理', () => {
    it('タグをクリックすると onTagsChange が呼ばれる', () => {
      const mockOnTagsChange = vi.fn();

      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: '契約書', color: 'success', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as any);

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={mockOnTagsChange} />
        </RepositoryTestWrapper>
      );

      const invoiceChip = screen.getByText('請求書');
      fireEvent.click(invoiceChip);

      expect(mockOnTagsChange).toHaveBeenCalledWith(['tag-001']);
    });

    it('選択済みタグをクリックすると選択解除される', () => {
      const mockOnTagsChange = vi.fn();

      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as any);

      render(
        <RepositoryTestWrapper>
          <TagFilter selectedTagIds={['tag-001']} onTagsChange={mockOnTagsChange} />
        </RepositoryTestWrapper>
      );

      const invoiceChip = screen.getByText('請求書');
      fireEvent.click(invoiceChip);

      expect(mockOnTagsChange).toHaveBeenCalledWith([]);
    });

    it('複数タグを選択できる', () => {
      const mockOnTagsChange = vi.fn();

      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: '契約書', color: 'success', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as any);

      const { rerender } = render(
        <RepositoryTestWrapper>
          <TagFilter selectedTagIds={[]} onTagsChange={mockOnTagsChange} />
        </RepositoryTestWrapper>
      );

      // 最初のタグを選択
      fireEvent.click(screen.getByText('請求書'));
      expect(mockOnTagsChange).toHaveBeenCalledWith(['tag-001']);

      // 2つ目のタグを選択
      rerender(
        <RepositoryTestWrapper>
          <TagFilter selectedTagIds={['tag-001']} onTagsChange={mockOnTagsChange} />
        </RepositoryTestWrapper>
      );

      fireEvent.click(screen.getByText('契約書'));
      expect(mockOnTagsChange).toHaveBeenCalledWith(['tag-001', 'tag-002']);
    });
  });

  describe('T059: フィルター適用とリセット', () => {
    it('選択中のタグは filled variant で表示される', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: '契約書', color: 'success', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as any);

      render(
        <RepositoryTestWrapper>
          <TagFilter selectedTagIds={['tag-001']} />
        </RepositoryTestWrapper>
      );

      const invoiceChip = screen.getByTestId('tag-chip-tag-001');
      const contractChip = screen.getByTestId('tag-chip-tag-002');

      // 選択中のタグは filled (class に MuiChip-filled が含まれる)
      expect(invoiceChip.className).toContain('MuiChip-filled');
      
      // 未選択のタグは outlined
      expect(contractChip.className).toContain('MuiChip-outlined');
    });

    it('全てのタグを選択解除してフィルターをリセット', () => {
      const mockOnTagsChange = vi.fn();

      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: '契約書', color: 'success', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as any);

      const { rerender } = render(
        <RepositoryTestWrapper>
          <TagFilter selectedTagIds={['tag-001', 'tag-002']} onTagsChange={mockOnTagsChange} />
        </RepositoryTestWrapper>
      );

      // 1つ目を解除
      fireEvent.click(screen.getByText('請求書'));
      expect(mockOnTagsChange).toHaveBeenCalledWith(['tag-002']);

      // 2つ目も解除
      rerender(
        <RepositoryTestWrapper>
          <TagFilter selectedTagIds={['tag-002']} onTagsChange={mockOnTagsChange} />
        </RepositoryTestWrapper>
      );

      fireEvent.click(screen.getByText('契約書'));
      expect(mockOnTagsChange).toHaveBeenCalledWith([]);
    });
  });
});
