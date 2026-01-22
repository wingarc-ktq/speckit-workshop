/**
 * React コンポーネントテストテンプレート（モックあり）
 *
 * このテンプレートは、外部依存（API、カスタムフック、子コンポーネント）を持つ
 * コンポーネントのテストに使用します。
 *
 * 使用例：
 * - APIを呼び出すコンポーネント
 * - カスタムフックを使用するコンポーネント
 * - 複雑な子コンポーネントを持つコンポーネント
 */

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { ComponentName } from '../ComponentName';
import { useCustomHook } from '@/presentations/hooks/useCustomHook';

/**
 * useCustomHook をモック化
 *
 * 理由：このコンポーネントのテストではフックの内部実装ではなく、
 * フックが返すデータに基づくUIの振る舞いをテストしたいため。
 * フックの実装は別途 useCustomHook.test.ts でテストされる。
 */
vi.mock('@/presentations/hooks/useCustomHook', () => ({
  useCustomHook: vi.fn(),
}));

/**
 * 複雑な子コンポーネントをモック化
 *
 * 理由：HeavyChildComponent は重い処理を含み、親コンポーネントの
 * テストに不要な複雑性をもたらすため。子コンポーネント自体は
 * HeavyChildComponent.test.tsx で個別にテストされる。
 */
vi.mock('../HeavyChildComponent', () => ({
  HeavyChildComponent: ({ data }: { data: string }) => (
    <div data-testid="heavy-child-mock">{data}</div>
  ),
}));

describe('ComponentName', () => {
  /**
   * レンダリングヘルパー関数
   * RepositoryTestWrapper でラップして Repository と QueryClient を提供
   */
  const renderComponent = (props?: Partial<React.ComponentProps<typeof ComponentName>>) => {
    return render(
      <RepositoryTestWrapper>
        <ComponentName
          defaultProp="default value"
          {...props}
        />
      </RepositoryTestWrapper>
    );
  };

  describe('初期表示', () => {
    test('ローディング状態が正しく表示されること', () => {
      // モックの戻り値を設定
      vi.mocked(useCustomHook).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as unknown as ReturnType<typeof useCustomHook>);

      renderComponent();

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('データ')).not.toBeInTheDocument();
    });

    test('データが正しく表示されること', () => {
      vi.mocked(useCustomHook).mockReturnValue({
        data: { id: '1', name: 'テストデータ' },
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useCustomHook>);

      renderComponent();

      expect(screen.getByText('テストデータ')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    test('エラー時にエラーメッセージが表示されること', () => {
      const error = new Error('データの取得に失敗しました');
      vi.mocked(useCustomHook).mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
      } as unknown as ReturnType<typeof useCustomHook>);

      renderComponent();

      expect(screen.getByText(/データの取得に失敗しました/)).toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    test('空のデータの場合は空状態メッセージが表示されること', () => {
      vi.mocked(useCustomHook).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useCustomHook>);

      renderComponent();

      expect(screen.getByText('データがありません')).toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('リロードボタンをクリックするとデータが再取得されること', async () => {
      const refetch = vi.fn();
      vi.mocked(useCustomHook).mockReturnValue({
        data: { id: '1', name: 'テストデータ' },
        isLoading: false,
        error: null,
        refetch,
      } as unknown as ReturnType<typeof useCustomHook>);

      const user = userEvent.setup();
      renderComponent();

      const reloadButton = screen.getByRole('button', { name: '再読み込み' });
      await user.click(reloadButton);

      expect(refetch).toHaveBeenCalledTimes(1);
    });

    test('アイテムをクリックすると詳細モーダルが開くこと', async () => {
      vi.mocked(useCustomHook).mockReturnValue({
        data: [
          { id: '1', name: 'アイテム1' },
          { id: '2', name: 'アイテム2' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useCustomHook>);

      const user = userEvent.setup();
      renderComponent();

      const item = screen.getByText('アイテム1');
      await user.click(item);

      // モーダルが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByText('アイテム1の詳細')).toBeInTheDocument();
    });

    test('フィルター入力時に検索結果が更新されること', async () => {
      vi.mocked(useCustomHook).mockReturnValue({
        data: [
          { id: '1', name: 'テストアイテム' },
          { id: '2', name: '別のアイテム' },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useCustomHook>);

      const user = userEvent.setup();
      renderComponent();

      const searchInput = screen.getByRole('textbox', { name: '検索' });
      await user.type(searchInput, 'テスト');

      // デバウンス処理を待つ
      await waitFor(() => {
        expect(screen.getByText('テストアイテム')).toBeInTheDocument();
        expect(screen.queryByText('別のアイテム')).not.toBeInTheDocument();
      });
    });
  });

  describe('Repository との連携', () => {
    test('リポジトリのメソッドが正しく呼ばれること', async () => {
      const mockGetData = vi.fn().mockResolvedValue({ id: '1', name: 'データ' });

      vi.mocked(useCustomHook).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useCustomHook>);

      const user = userEvent.setup();
      renderComponent();

      // override を使ってリポジトリをモック
      render(
        <RepositoryTestWrapper
          override={{
            customRepository: {
              getData: mockGetData,
            },
          }}
        >
          <ComponentName />
        </RepositoryTestWrapper>
      );

      const button = screen.getByRole('button', { name: 'データ取得' });
      await user.click(button);

      await waitFor(() => {
        expect(mockGetData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('エッジケース', () => {
    test('複数回の高速クリックでも正しく動作すること', async () => {
      const handleClick = vi.fn();
      vi.mocked(useCustomHook).mockReturnValue({
        data: { id: '1', name: 'データ' },
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useCustomHook>);

      const user = userEvent.setup();
      renderComponent({ onClick: handleClick });

      const button = screen.getByRole('button', { name: 'クリック' });

      // 高速で3回クリック
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    test('タイムアウト時に適切なエラーが表示されること', async () => {
      const timeoutError = new Error('TIMEOUT');
      vi.mocked(useCustomHook).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: timeoutError,
      } as unknown as ReturnType<typeof useCustomHook>);

      renderComponent();

      expect(screen.getByText(/タイムアウトしました/)).toBeInTheDocument();
    });

    test('ネットワークエラー時に再試行ボタンが表示されること', async () => {
      const networkError = new Error('NETWORK_ERROR');
      const refetch = vi.fn();

      vi.mocked(useCustomHook).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: networkError,
        refetch,
      } as unknown as ReturnType<typeof useCustomHook>);

      const user = userEvent.setup();
      renderComponent();

      expect(screen.getByText(/ネットワークエラー/)).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: '再試行' });
      await user.click(retryButton);

      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('パフォーマンス', () => {
    test('大量のデータでもレンダリングできること', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        name: `アイテム${i}`,
      }));

      vi.mocked(useCustomHook).mockReturnValue({
        data: largeData,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useCustomHook>);

      renderComponent();

      // 仮想化されたリストの最初の項目が表示されることを確認
      expect(screen.getByText('アイテム0')).toBeInTheDocument();
    });
  });

  describe('子コンポーネントとの連携', () => {
    test('モックされた子コンポーネントが正しくレンダリングされること', () => {
      vi.mocked(useCustomHook).mockReturnValue({
        data: { id: '1', name: 'テストデータ' },
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useCustomHook>);

      renderComponent();

      // モックされた子コンポーネントが表示されることを確認
      expect(screen.getByTestId('heavy-child-mock')).toBeInTheDocument();
      expect(screen.getByText('テストデータ')).toBeInTheDocument();
    });
  });
});
