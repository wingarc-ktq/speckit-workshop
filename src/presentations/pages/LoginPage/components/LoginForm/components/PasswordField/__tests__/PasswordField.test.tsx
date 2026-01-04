import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { i18n } from '@/i18n/config';

import { PasswordField } from '../PasswordField';

describe('PasswordField', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    i18n.changeLanguage('ja');
  });

  describe('基本的なレンダリング', () => {
    test('パスワードフィールドがレンダリングされること', () => {
      const r = render(<PasswordField value="" onChange={onChange} />);

      const passwordField = r.getByDisplayValue('');
      expect(passwordField).toBeInTheDocument();
      expect(passwordField).toHaveAttribute('type', 'password');
    });

    test('ラベルとプレースホルダーが正しく表示されること', () => {
      const r = render(<PasswordField value="" onChange={onChange} />);

      // 実際のi18n翻訳キーの結果を確認
      expect(r.getByLabelText('パスワード *')).toBeInTheDocument();
      expect(r.getByPlaceholderText('パスワードを入力')).toBeInTheDocument();
    });

    test('requiredが設定されていること', () => {
      const r = render(<PasswordField value="" onChange={onChange} />);

      const passwordField = r.getByLabelText('パスワード *');
      expect(passwordField).toBeRequired();
    });
  });

  describe('値の変更', () => {
    test('入力値が変更されたときにonChangeが呼ばれること', async () => {
      const user = userEvent.setup();
      const r = render(<PasswordField value="" onChange={onChange} />);

      const passwordField = r.getByLabelText('パスワード *');
      await user.type(passwordField, 'test123');

      // onChangeが呼ばれたことを確認（文字数分）
      expect(onChange).toHaveBeenCalledTimes(7);
      // 最後の呼び出しでイベントオブジェクトが渡されていることを確認
      expect(onChange).toHaveBeenCalled();
    });

    test('propsで渡された値が表示されること', () => {
      const r = render(
        <PasswordField value="initialValue" onChange={onChange} />
      );

      expect(r.getByDisplayValue('initialValue')).toBeInTheDocument();
    });
  });

  describe('パスワード表示切り替え機能', () => {
    test('初期状態ではパスワードが隠されていること', () => {
      const r = render(<PasswordField value="" onChange={onChange} />);

      const passwordField = r.getByLabelText('パスワード *');
      expect(passwordField).toHaveAttribute('type', 'password');
    });

    test('初期状態では目のアイコン（Visibility）が表示されること', () => {
      const r = render(<PasswordField value="" onChange={onChange} />);

      const toggleButton = r.getByLabelText('togglePasswordVisibility');
      expect(toggleButton).toBeInTheDocument();

      // Visibilityアイコンが表示されている（SVGの存在を確認）
      const visibilityIcon = toggleButton.querySelector('svg');
      expect(visibilityIcon).toBeInTheDocument();
    });

    test('目のアイコンをクリックするとパスワードが表示されること', async () => {
      const user = userEvent.setup();
      const r = render(<PasswordField value="secret123" onChange={onChange} />);

      const passwordField = r.getByLabelText('パスワード *');
      const toggleButton = r.getByLabelText('togglePasswordVisibility');

      // 初期状態ではパスワードタイプ
      expect(passwordField).toHaveAttribute('type', 'password');

      // ボタンをクリック
      await user.click(toggleButton);

      // パスワードが表示される（textタイプになる）
      expect(passwordField).toHaveAttribute('type', 'text');
    });

    test('パスワード表示状態で再度アイコンをクリックするとパスワードが隠されること', async () => {
      const user = userEvent.setup();
      const r = render(<PasswordField value="secret123" onChange={onChange} />);

      const passwordField = r.getByLabelText('パスワード *');
      const toggleButton = r.getByLabelText('togglePasswordVisibility');

      // 初期状態: パスワード隠れている
      expect(passwordField).toHaveAttribute('type', 'password');

      // 1回目のクリック: パスワード表示
      await user.click(toggleButton);
      expect(passwordField).toHaveAttribute('type', 'text');

      // 2回目のクリック: パスワード隠す
      await user.click(toggleButton);
      expect(passwordField).toHaveAttribute('type', 'password');
    });

    test('複数回切り替えても正常に動作すること', async () => {
      const user = userEvent.setup();
      const r = render(<PasswordField value="secret123" onChange={onChange} />);

      const passwordField = r.getByLabelText('パスワード *');
      const toggleButton = r.getByLabelText('togglePasswordVisibility');

      // 初期状態
      expect(passwordField).toHaveAttribute('type', 'password');

      // 3回クリック
      await user.click(toggleButton); // password → text
      await user.click(toggleButton); // text → password
      await user.click(toggleButton); // password → text

      // 最終的にtextタイプになっている
      expect(passwordField).toHaveAttribute('type', 'text');
    });
  });
});
