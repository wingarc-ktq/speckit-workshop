/**
 * React コンポーネントテストテンプレート（シンプルなケース）
 *
 * このテンプレートは、外部依存が少ないシンプルなコンポーネントのテストに使用します。
 * モックが不要な場合はこのテンプレートを使用してください。
 *
 * 使用例：
 * - プレゼンテーションコンポーネント（ボタン、カード、入力フォームなど）
 * - 外部APIやカスタムフックに依存しないコンポーネント
 */

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  /**
   * レンダリングヘルパー関数
   * コンポーネントのレンダリングを統一的に行うための関数
   */
  const renderComponent = (props?: Partial<React.ComponentProps<typeof ComponentName>>) => {
    return render(
      <ComponentName
        // デフォルトのpropsをここに記述
        defaultProp="default value"
        {...props}
      />
    );
  };

  describe('初期表示', () => {
    test('コンポーネントが正しく表示されること', () => {
      renderComponent();

      // getByRole を使用したアクセシビリティ重視のクエリ
      expect(screen.getByRole('button', { name: 'ボタン名' })).toBeInTheDocument();

      // テキストコンテンツの確認
      expect(screen.getByText('表示されるテキスト')).toBeInTheDocument();
    });

    test('初期値が正しく設定されていること', () => {
      renderComponent({ initialValue: 'test' });

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('test');
    });

    test('デフォルトのスタイルが適用されていること', () => {
      renderComponent();

      const element = screen.getByTestId('component-container');
      expect(element).toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('ボタンをクリックするとハンドラーが呼ばれること', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderComponent({ onClick: handleClick });

      const button = screen.getByRole('button', { name: 'ボタン名' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('入力フィールドにテキストを入力できること', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      renderComponent({ onChange: handleChange });

      const input = screen.getByRole('textbox');
      await user.type(input, 'テスト入力');

      expect(input).toHaveValue('テスト入力');
      expect(handleChange).toHaveBeenCalled();
    });

    test('Enterキーを押すとsubmitされること', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      renderComponent({ onSubmit: handleSubmit });

      const input = screen.getByRole('textbox');
      await user.type(input, 'テスト{Enter}');

      expect(handleSubmit).toHaveBeenCalledWith('テスト');
    });

    test('ホバー時にツールチップが表示されること', async () => {
      const user = userEvent.setup();

      renderComponent();

      const button = screen.getByRole('button', { name: 'ボタン名' });
      await user.hover(button);

      expect(await screen.findByText('ツールチップテキスト')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    test('空の値が渡された場合でもエラーにならないこと', () => {
      renderComponent({ value: '' });

      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    test('無効化された状態では操作できないこと', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderComponent({ onClick: handleClick, disabled: true });

      const button = screen.getByRole('button', { name: 'ボタン名' });
      expect(button).toBeDisabled();

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('長いテキストが正しく表示されること', () => {
      const longText = 'あ'.repeat(1000);
      renderComponent({ text: longText });

      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('適切なaria属性が設定されていること', () => {
      renderComponent({ required: true });

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    test('キーボードナビゲーションが機能すること', async () => {
      const user = userEvent.setup();

      renderComponent();

      // Tabキーでフォーカス移動
      await user.tab();
      const firstButton = screen.getByRole('button', { name: '最初のボタン' });
      expect(firstButton).toHaveFocus();

      await user.tab();
      const secondButton = screen.getByRole('button', { name: '次のボタン' });
      expect(secondButton).toHaveFocus();
    });
  });
});
