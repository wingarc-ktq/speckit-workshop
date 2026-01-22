import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PaginationControls } from '../PaginationControls';

describe('PaginationControls', () => {
  const defaultProps = {
    page: 1,
    totalPages: 5,
    total: 100,
    onPageChange: vi.fn(),
  };

  test('現在のページ範囲が表示されること', () => {
    render(<PaginationControls {...defaultProps} />);

    expect(screen.getByText('1-20 / 100件')).toBeInTheDocument();
  });

  test('2ページ目の範囲が正しく表示されること', () => {
    render(<PaginationControls {...defaultProps} page={2} />);

    expect(screen.getByText('21-40 / 100件')).toBeInTheDocument();
  });

  test('最終ページの範囲が正しく表示されること', () => {
    render(<PaginationControls {...defaultProps} page={5} />);

    expect(screen.getByText('81-100 / 100件')).toBeInTheDocument();
  });

  test('カスタムitemsPerPageで範囲が正しく表示されること', () => {
    render(<PaginationControls {...defaultProps} itemsPerPage={10} />);

    expect(screen.getByText('1-10 / 100件')).toBeInTheDocument();
  });

  test('ページネーションコントロールが表示されること', () => {
    render(<PaginationControls {...defaultProps} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('ページを変更するとonPageChangeが呼ばれること', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} onPageChange={onPageChange} />);

    // 次のページボタンをクリックしてページ2に移動
    const nextButton = screen.getByRole('button', { name: /次のページへ|Go to next page/ });
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test('次のページボタンをクリックするとonPageChangeが呼ばれること', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} onPageChange={onPageChange} />);

    const nextButton = screen.getByRole('button', { name: /次のページへ|Go to next page/ });
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test('前のページボタンをクリックするとonPageChangeが呼ばれること', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} page={3} onPageChange={onPageChange} />);

    const prevButton = screen.getByRole('button', { name: /前のページへ|Go to previous page/ });
    await user.click(prevButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test('1ページ目では前のページボタンが無効化されること', () => {
    render(<PaginationControls {...defaultProps} page={1} />);

    const prevButton = screen.getByRole('button', { name: /前のページへ|Go to previous page/ });
    expect(prevButton).toBeDisabled();
  });

  test('最終ページでは次のページボタンが無効化されること', () => {
    render(<PaginationControls {...defaultProps} page={5} />);

    const nextButton = screen.getByRole('button', { name: /次のページへ|Go to next page/ });
    expect(nextButton).toBeDisabled();
  });
});
