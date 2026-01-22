import { render, screen } from '@testing-library/react';

import { AppMain } from '../AppMain';

describe('AppMain', () => {
  test('子要素が表示されること', () => {
    render(
      <AppMain>
        <div data-testid="child">テストコンテンツ</div>
      </AppMain>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  test('main要素として表示されること', () => {
    render(
      <AppMain>
        <div>コンテンツ</div>
      </AppMain>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('複数の子要素が表示されること', () => {
    render(
      <AppMain>
        <div data-testid="child-1">子要素1</div>
        <div data-testid="child-2">子要素2</div>
      </AppMain>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  test('子要素がない場合でもエラーにならないこと', () => {
    const { container } = render(<AppMain />);

    expect(container.querySelector('main')).toBeInTheDocument();
  });
});
