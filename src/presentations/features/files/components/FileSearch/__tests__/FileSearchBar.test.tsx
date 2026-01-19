import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FileSearchBar } from '../FileSearchBar';

describe('FileSearchBar', () => {
  it('プレースホルダーが表示される', () => {
    render(<FileSearchBar value="" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('ファイル名やタグで検索...')).toBeInTheDocument();
  });

  it('カスタムプレースホルダーを設定できる', () => {
    render(<FileSearchBar value="" onChange={vi.fn()} placeholder="カスタム検索..." />);

    expect(screen.getByPlaceholderText('カスタム検索...')).toBeInTheDocument();
  });

  it('入力値が表示される', () => {
    render(<FileSearchBar value="test query" onChange={vi.fn()} />);

    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('入力時にonChangeが呼ばれる', () => {
    const handleChange = vi.fn();
    render(<FileSearchBar value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('ファイル名やタグで検索...');
    fireEvent.change(input, { target: { value: 'new query' } });

    expect(handleChange).toHaveBeenCalledWith('new query');
  });

  it('検索アイコンが表示される', () => {
    render(<FileSearchBar value="" onChange={vi.fn()} />);

    // SearchIcon は aria-label がないため、親要素から確認
    const input = screen.getByPlaceholderText('ファイル名やタグで検索...');
    expect(input).toBeInTheDocument();
  });

  it('値がある時のみクリアボタンが表示される', () => {
    const { rerender } = render(<FileSearchBar value="" onChange={vi.fn()} />);

    // 空の時はクリアボタンなし
    expect(screen.queryByLabelText('検索をクリア')).not.toBeInTheDocument();

    // 値がある時はクリアボタンあり
    rerender(<FileSearchBar value="test" onChange={vi.fn()} />);
    expect(screen.getByLabelText('検索をクリア')).toBeInTheDocument();
  });

  it('クリアボタンをクリックすると空文字でonChangeが呼ばれる', () => {
    const handleChange = vi.fn();
    render(<FileSearchBar value="test query" onChange={handleChange} />);

    const clearButton = screen.getByLabelText('検索をクリア');
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('検索バーのスタイルが適用される', () => {
    render(<FileSearchBar value="" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText('ファイル名やタグで検索...');
    const textField = input.closest('.MuiTextField-root');

    expect(textField).toBeInTheDocument();
  });
});
