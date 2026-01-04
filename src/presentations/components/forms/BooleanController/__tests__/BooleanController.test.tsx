import { zodResolver } from '@hookform/resolvers/zod';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { BooleanController } from '../BooleanController';

const schema = z.object({
  agreeToTerms: z.boolean(),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const TestForm = ({
  defaultValues,
  onSubmit,
}: {
  defaultValues: FormData;
  onSubmit: (data: FormData) => void;
}) => {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <BooleanController
        name="agreeToTerms"
        control={control}
        render={(props) => (
          <FormControlLabel
            control={<Checkbox {...props} />}
            label="利用規約に同意する"
          />
        )}
      />
      <BooleanController
        name="rememberMe"
        control={control}
        render={(props) => (
          <FormControlLabel
            control={<Checkbox {...props} />}
            label="ログイン状態を記憶する"
          />
        )}
      />
      <button type="submit">送信</button>
    </form>
  );
};

describe('BooleanController', () => {
  describe('正常系', () => {
    test('初期値がfalseの場合、チェックボックスは未チェック状態', () => {
      const onSubmit = vi.fn();
      render(
        <TestForm
          defaultValues={{ agreeToTerms: false, rememberMe: false }}
          onSubmit={onSubmit}
        />
      );

      const agreeCheckbox = screen.getByRole('checkbox', {
        name: '利用規約に同意する',
      });
      const rememberCheckbox = screen.getByRole('checkbox', {
        name: 'ログイン状態を記憶する',
      });

      expect(agreeCheckbox).not.toBeChecked();
      expect(rememberCheckbox).not.toBeChecked();
    });

    test('初期値がtrueの場合、チェックボックスはチェック状態', () => {
      const onSubmit = vi.fn();
      render(
        <TestForm
          defaultValues={{ agreeToTerms: true, rememberMe: true }}
          onSubmit={onSubmit}
        />
      );

      const agreeCheckbox = screen.getByRole('checkbox', {
        name: '利用規約に同意する',
      });
      const rememberCheckbox = screen.getByRole('checkbox', {
        name: 'ログイン状態を記憶する',
      });

      expect(agreeCheckbox).toBeChecked();
      expect(rememberCheckbox).toBeChecked();
    });

    test('チェックボックスをクリックすると値が切り替わる', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <TestForm
          defaultValues={{ agreeToTerms: false, rememberMe: false }}
          onSubmit={onSubmit}
        />
      );

      const agreeCheckbox = screen.getByRole('checkbox', {
        name: '利用規約に同意する',
      });

      // 初期状態は未チェック
      expect(agreeCheckbox).not.toBeChecked();

      // クリックするとチェック状態になる
      await user.click(agreeCheckbox);
      expect(agreeCheckbox).toBeChecked();

      // もう一度クリックすると未チェック状態になる
      await user.click(agreeCheckbox);
      expect(agreeCheckbox).not.toBeChecked();
    });

    test('フォーム送信時に正しい値が送信される', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <TestForm
          defaultValues={{ agreeToTerms: false, rememberMe: false }}
          onSubmit={onSubmit}
        />
      );

      const agreeCheckbox = screen.getByRole('checkbox', {
        name: '利用規約に同意する',
      });
      const submitButton = screen.getByRole('button', { name: '送信' });

      // 1つ目のチェックボックスをチェック
      await user.click(agreeCheckbox);

      // フォーム送信
      await user.click(submitButton);

      // 正しい値が送信されることを確認
      expect(onSubmit).toHaveBeenCalledWith(
        {
          agreeToTerms: true,
          rememberMe: false,
        },
        expect.anything() // イベントオブジェクトを無視
      );
    });

    test('複数のチェックボックスを独立して操作できる', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <TestForm
          defaultValues={{ agreeToTerms: false, rememberMe: false }}
          onSubmit={onSubmit}
        />
      );

      const agreeCheckbox = screen.getByRole('checkbox', {
        name: '利用規約に同意する',
      });
      const rememberCheckbox = screen.getByRole('checkbox', {
        name: 'ログイン状態を記憶する',
      });

      // 両方のチェックボックスをチェック
      await user.click(agreeCheckbox);
      await user.click(rememberCheckbox);

      expect(agreeCheckbox).toBeChecked();
      expect(rememberCheckbox).toBeChecked();

      // フォーム送信
      const submitButton = screen.getByRole('button', { name: '送信' });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        {
          agreeToTerms: true,
          rememberMe: true,
        },
        expect.anything() // イベントオブジェクトを無視
      );
    });
  });
});
