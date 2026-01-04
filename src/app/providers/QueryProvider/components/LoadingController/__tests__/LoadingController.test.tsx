import React, { Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

import { GLOBAL_LOADING } from '@/presentations/hooks/queries/constants';

import { LoadingController } from '../LoadingController';

// テスト用のコンポーネント
const TestQueryComponent: React.FC = () => {
  const { data } = useQuery({
    queryKey: [GLOBAL_LOADING, 'test-query'],
    queryFn: () =>
      new Promise<string>((resolve) => setTimeout(() => resolve('data'), 100)),
  });

  return <div>Query Result: {data || 'loading'}</div>;
};

const TestMutationComponent: React.FC = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      new Promise<string>((resolve) =>
        setTimeout(() => resolve('success'), 100)
      ),
  });

  // 初回に1回実行
  React.useEffect(() => {
    mutate();
  }, [mutate]);

  return <div>Mutation Status: {isPending ? 'loading' : 'done'}</div>;
};

const TestSuspenseQueryComponent: React.FC = () => {
  const { data } = useSuspenseQuery({
    queryKey: [GLOBAL_LOADING, 'test-suspense-query'],
    queryFn: () =>
      new Promise<string>((resolve) =>
        setTimeout(() => resolve('suspense-data'), 100)
      ),
  });

  return <div>Suspense Query Result: {data}</div>;
};

// GLOBAL_LOADINGを含まないクエリ（ローディング表示されない）
const TestNonGlobalLoadingQueryComponent: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['test-non-global-loading'],
    queryFn: () =>
      new Promise<string>((resolve) =>
        setTimeout(() => resolve('non-global-data'), 100)
      ),
  });

  return <div>Non Global Loading Query Result: {data || 'loading'}</div>;
};

// GLOBAL_LOADINGを含まないSuspenseクエリ（ローディング表示されない）
const TestNonGlobalLoadingSuspenseQueryComponent: React.FC = () => {
  const { data } = useSuspenseQuery({
    queryKey: ['test-non-global-suspense'],
    queryFn: () =>
      new Promise<string>((resolve) =>
        setTimeout(() => resolve('non-global-suspense-data'), 100)
      ),
  });

  return <div>Non Global Suspense Query Result: {data}</div>;
};

describe('LoadingController', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithQueryClient = (children: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <LoadingController>{children}</LoadingController>
      </QueryClientProvider>
    );
  };

  test('リクエストがないときはローディングが表示されないこと', async () => {
    renderWithQueryClient(<div>No Requests</div>);

    const backdrop = screen.getByTestId('loading-overlay');
    expect(backdrop).toHaveStyle({ visibility: 'hidden' });
  });

  describe('queryKeyにglobalLoadingがないqueryはローディングが表示されないこと', () => {
    test.each([
      {
        name: 'useQuery',
        component: <TestNonGlobalLoadingQueryComponent />,
        expectedText: 'Non Global Loading Query Result: non-global-data',
      },
      {
        name: 'useSuspenseQuery',
        component: (
          <Suspense fallback={<div>Suspense Loading...</div>}>
            <TestNonGlobalLoadingSuspenseQueryComponent />
          </Suspense>
        ),
        expectedText:
          'Non Global Suspense Query Result: non-global-suspense-data',
      },
    ])(
      '$nameでローディングが表示されないこと',
      async ({ component, expectedText }) => {
        renderWithQueryClient(component);

        const backdrop = screen.getByTestId('loading-overlay');

        // GLOBAL_LOADINGを含まないクエリはローディングオーバーレイが表示されない
        expect(backdrop).toHaveStyle({ visibility: 'hidden' });

        // データ取得完了まで待機
        await waitFor(() => {
          expect(screen.getByText(expectedText)).toBeInTheDocument();
        });

        // データ取得完了後もローディングオーバーレイは非表示のまま
        expect(backdrop).toHaveStyle({ visibility: 'hidden' });
      }
    );
  });

  describe('それ以外はローディング状態が正しく表示されること', () => {
    test.each([
      {
        name: 'useQuery',
        component: <TestQueryComponent />,
      },
      {
        name: 'useMutation',
        component: <TestMutationComponent />,
      },
      {
        name: 'useSuspenseQuery',
        component: (
          <Suspense fallback={<div>Suspense Loading...</div>}>
            <TestSuspenseQueryComponent />
          </Suspense>
        ),
      },
    ])('$nameでローディング状態が正しく表示される', async ({ component }) => {
      renderWithQueryClient(component);

      const backdrop = screen.getByTestId('loading-overlay');

      // ローディング中はLoadingOverlayが表示される
      await waitFor(() => {
        expect(backdrop).not.toHaveStyle({ visibility: 'hidden' });
      });

      // ローディング完了後は非表示になる
      await waitFor(() => {
        expect(backdrop).toHaveStyle({ visibility: 'hidden' });
      });
    });
  });
});
