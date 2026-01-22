import { render, screen, waitFor } from '@testing-library/react';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';

import { AuthChecker } from '../AuthChecker';

describe('AuthChecker', () => {
  test('認証済みの場合は子要素が表示されること', async () => {
    render(
      <RepositoryTestWrapper
        override={{
          auth: {
            getCurrentSession: async () => ({
              user: { id: 'user-1', name: 'テストユーザー', email: 'test@example.com' },
            }),
          },
        }}
        hasSuspense
      >
        <AuthChecker>
          <div data-testid="protected-content">保護されたコンテンツ</div>
        </AuthChecker>
      </RepositoryTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument();
    });
  });

  test('認証中はサスペンスフォールバックが表示されること', () => {
    render(
      <RepositoryTestWrapper
        override={{
          auth: {
            getCurrentSession: () => new Promise(() => {}), // 永遠に解決しないPromise
          },
        }}
        hasSuspense
      >
        <AuthChecker>
          <div data-testid="protected-content">保護されたコンテンツ</div>
        </AuthChecker>
      </RepositoryTestWrapper>
    );

    expect(screen.getByTestId('suspense')).toBeInTheDocument();
  });
});
