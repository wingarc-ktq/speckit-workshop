import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * ログインフォームの入力フィールドを取得する
 */
export const getLoginFormElements = () => {
  const userIdInput = screen.getByLabelText(/メールアドレスまたはユーザー名/i);
  const passwordInput = screen.getByLabelText(/パスワード/i);
  const rememberMeCheckbox = screen.getByLabelText(/ログイン状態を記録する/i);
  const submitButton = screen.getByRole('button', { name: /ログイン/i });

  return {
    userIdInput,
    passwordInput,
    rememberMeCheckbox,
    submitButton,
  };
};

/**
 * ログインフォームに値を入力する
 */
export const fillLoginForm = async (credentials: {
  userId: string;
  password: string;
  rememberMe: boolean;
}) => {
  const user = userEvent.setup();
  const { userIdInput, passwordInput, rememberMeCheckbox } =
    getLoginFormElements();

  if (credentials.userId) {
    await user.clear(userIdInput);
    await user.type(userIdInput, credentials.userId);
  }

  if (credentials.password) {
    await user.clear(passwordInput);
    await user.type(passwordInput, credentials.password);
  }

  if (credentials.rememberMe) {
    await user.click(rememberMeCheckbox);
  }
};

/**
 * ログインボタンをクリックする
 */
export const clickLoginButton = async () => {
  const user = userEvent.setup();
  const submitButton = screen.getByRole('button', { name: /ログイン/i });
  await user.click(submitButton);
};
