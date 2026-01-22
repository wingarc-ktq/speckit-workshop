import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { TagInfo } from '@/domain/models/files/TagInfo';

import { CategoryFilter } from '../CategoryFilter';

describe('CategoryFilter', () => {
  const mockTags: TagInfo[] = [
    { id: 'tag-1', name: '重要', color: 'red', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'tag-2', name: 'ドキュメント', color: 'blue', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'tag-3', name: '未分類', color: 'gray', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ];

  test('タイトルが表示されること', () => {
    render(<CategoryFilter tags={mockTags} selectedTags={[]} onTagClick={vi.fn()} />);

    expect(screen.getByText('カテゴリーで絞り込み')).toBeInTheDocument();
  });

  test('全てのタグが表示されること', () => {
    render(<CategoryFilter tags={mockTags} selectedTags={[]} onTagClick={vi.fn()} />);

    expect(screen.getByText('重要')).toBeInTheDocument();
    expect(screen.getByText('ドキュメント')).toBeInTheDocument();
    expect(screen.getByText('未分類')).toBeInTheDocument();
  });

  test('タグをクリックするとonTagClickが呼ばれること', async () => {
    const user = userEvent.setup();
    const onTagClick = vi.fn();
    render(<CategoryFilter tags={mockTags} selectedTags={[]} onTagClick={onTagClick} />);

    await user.click(screen.getByText('重要'));

    expect(onTagClick).toHaveBeenCalledWith('tag-1');
  });

  test('選択されたタグはfilledスタイルで表示されること', () => {
    render(<CategoryFilter tags={mockTags} selectedTags={['tag-1']} onTagClick={vi.fn()} />);

    const selectedChip = screen.getByText('重要').closest('.MuiChip-root');
    expect(selectedChip).toHaveClass('MuiChip-filled');
  });

  test('選択されていないタグはoutlinedスタイルで表示されること', () => {
    render(<CategoryFilter tags={mockTags} selectedTags={['tag-1']} onTagClick={vi.fn()} />);

    const unselectedChip = screen.getByText('ドキュメント').closest('.MuiChip-root');
    expect(unselectedChip).toHaveClass('MuiChip-outlined');
  });

  test('複数のタグが選択できること', () => {
    render(<CategoryFilter tags={mockTags} selectedTags={['tag-1', 'tag-2']} onTagClick={vi.fn()} />);

    const chip1 = screen.getByText('重要').closest('.MuiChip-root');
    const chip2 = screen.getByText('ドキュメント').closest('.MuiChip-root');

    expect(chip1).toHaveClass('MuiChip-filled');
    expect(chip2).toHaveClass('MuiChip-filled');
  });

  test('タグが空の場合は何も表示されないこと', () => {
    render(<CategoryFilter tags={[]} selectedTags={[]} onTagClick={vi.fn()} />);

    expect(screen.getByText('カテゴリーで絞り込み')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});