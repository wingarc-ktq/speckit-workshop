import { render, screen } from '@testing-library/react';

import { FileSearchResults } from '../FileSearchResults';

describe('FileSearchResults', () => {
  test('検索クエリが空の場合は何も表示されないこと', () => {
    const { container } = render(
      <FileSearchResults searchQuery="" resultCount={0} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('ローディング中は何も表示されないこと', () => {
    const { container } = render(
      <FileSearchResults searchQuery="test" resultCount={0} isLoading={true} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('検索結果がある場合に件数が表示されること', () => {
    render(<FileSearchResults searchQuery="test" resultCount={5} />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText(/5件/)).toBeInTheDocument();
  });

  test('検索結果が0件の場合にメッセージが表示されること', () => {
    render(<FileSearchResults searchQuery="notfound" resultCount={0} />);

    expect(screen.getByText('検索結果が見つかりません')).toBeInTheDocument();
    expect(screen.getByText(/notfound/)).toBeInTheDocument();
  });
});
