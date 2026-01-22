import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { TagFilter } from '@/presentations/components/files/TagFilter';
import { useTags } from '@/presentations/hooks/queries';

vi.mock('@/presentations/hooks/queries', () => ({
  useTags: vi.fn(),
}));

describe('TagFilter', () => {
  describe('T059: コンポーネント基本機能', () => {
    test('ローディング中はスピナーを表示', () => {
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

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('タグ一覧が表示される', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: '契約書', color: 'primary', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={() => {}} />
        </RepositoryTestWrapper>
      );

      expect(screen.getByText(/請求書/)).toBeInTheDocument();
      expect(screen.getByText(/契約書/)).toBeInTheDocument();
    });

    test('タグ一覧が空の場合はメッセージを表示', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={() => {}} />
        </RepositoryTestWrapper>
      );

      expect(screen.getByText('タグなし')).toBeInTheDocument();
    });

    test('タグが存在する場合は正しく表示される', () => {
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

      expect(screen.getByText(/請求書/)).toBeInTheDocument();
    });
  });

  describe('T060: 複数選択機能', () => {
    test('複数のタグを選択できる', async () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: '契約書', color: 'primary', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <RepositoryTestWrapper>
          <TagFilter selectedTagIds={[]} onTagsChange={onSelectionChange} />
        </RepositoryTestWrapper>
      );

      await user.click(screen.getByTestId('tag-chip-tag-001'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['tag-001']);

      // 2つ目のタグを選択（selectedTagIdsを更新した状態で再レンダリング）
      rerender(
        <RepositoryTestWrapper>
          <TagFilter selectedTagIds={['tag-001']} onTagsChange={onSelectionChange} />
        </RepositoryTestWrapper>
      );

      await user.click(screen.getByTestId('tag-chip-tag-002'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['tag-001', 'tag-002']);
    });

    test('選択したタグを解除できる', async () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <RepositoryTestWrapper>
          <TagFilter selectedTagIds={['tag-001']} onTagsChange={onSelectionChange} />
        </RepositoryTestWrapper>
      );

      // 既に選択されているタグをクリックすると解除される
      await user.click(screen.getByTestId('tag-chip-tag-001'));
      expect(onSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe('T061: フィルタリング動作', () => {
    test('選択されたタグでフィルタリングが実行される', async () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <RepositoryTestWrapper>
          <TagFilter onTagsChange={onSelectionChange} />
        </RepositoryTestWrapper>
      );

      const tagChip = screen.getByTestId('tag-chip-tag-001');
      await user.click(tagChip);

      expect(onSelectionChange).toHaveBeenCalled();
    });

    test('複数タグの組み合わせでフィルタリングできる', async () => {
      vi.mocked(useTags).mockReturnValue({
        data: [
          { id: 'tag-001', name: '請求書', color: 'error', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-002', name: '契約書', color: 'primary', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
          { id: 'tag-003', name: '議事録', color: 'info', createdAt: '2025-01-01', updatedAt: '2025-01-01', createdByUserId: 'user-123' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useTags>);

      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <RepositoryTestWrapper>
          <TagFilter selectedTagIds={[]} onTagsChange={onSelectionChange} />
        </RepositoryTestWrapper>
      );

      await user.click(screen.getByTestId('tag-chip-tag-001'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['tag-001']);

      // 2つ目のタグを選択（selectedTagIdsを更新）
      rerender(
        <RepositoryTestWrapper>
          <TagFilter selectedTagIds={['tag-001']} onTagsChange={onSelectionChange} />
        </RepositoryTestWrapper>
      );

      await user.click(screen.getByTestId('tag-chip-tag-002'));
      expect(onSelectionChange).toHaveBeenLastCalledWith(['tag-001', 'tag-002']);
    });
  });
});
