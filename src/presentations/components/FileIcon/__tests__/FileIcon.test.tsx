import { render, screen } from '@testing-library/react';

import { FileIcon } from '../FileIcon';

describe('FileIcon', () => {
  test('デフォルトサイズ（40px）で表示されること', () => {
    render(<FileIcon />);

    const container = screen.getByTestId('DescriptionIcon').parentElement;
    expect(container).toHaveStyle({ width: '40px', height: '40px' });
  });

  test('カスタムサイズで表示されること', () => {
    render(<FileIcon size={60} />);

    const container = screen.getByTestId('DescriptionIcon').parentElement;
    expect(container).toHaveStyle({ width: '60px', height: '60px' });
  });

  test('アイコンが表示されること', () => {
    render(<FileIcon />);

    expect(screen.getByTestId('DescriptionIcon')).toBeInTheDocument();
  });
});
