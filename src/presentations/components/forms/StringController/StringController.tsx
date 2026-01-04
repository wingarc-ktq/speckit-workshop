import { type TextFieldProps } from '@mui/material/TextField';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

interface StringControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control: Control<TFieldValues>;
  render: (props: TextFieldProps) => React.ReactElement;
}

/**
 * react-hook-formのControllerを使用した文字列入力フィールドコンポーネント
 *
 * @description
 * - render propsパターンを採用し、任意のTextFieldコンポーネントをレンダリングできます
 * - ジェネリクスを使用して型安全性を保ちながら、バリデーションエラーの表示も自動で行います
 * - TextFieldPropsを通じて、error, helperText, size, fullWidthが自動的に設定されます
 * - カスタムTextFieldコンポーネント（MUIベース、カスタムデザイン）の両方に対応可能
 *
 * @template TFieldValues - react-hook-formで管理するフォーム全体のデータ型（例: { name: string, email: string }）
 * @template TName - フォーム内の特定フィールド名の型（TFieldValuesのキーから推論される）
 *
 * @param props - コンポーネントのプロパティ
 * @param props.name - フィールド名（フォームデータのキー）
 * @param props.control - react-hook-formのcontrolオブジェクト
 * @param props.render - TextFieldPropsを受け取り、TextFieldをレンダリングする関数
 *
 * @example
 * ```tsx
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 * import { z } from 'zod';
 * import TextField from '@mui/material/TextField';
 * import { StringController } from '@/presentations/components/forms';
 *
 * // フォームのスキーマ定義
 * const userSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * });
 *
 * type UserFormData = z.infer<typeof userSchema>;
 *
 * export const UserForm = () => {
 *   const { control, handleSubmit } = useForm<UserFormData>({
 *     resolver: zodResolver(userSchema),
 *     defaultValues: {
 *       name: '',
 *       email: '',
 *     },
 *   });
 *
 *   const onSubmit = (data: UserFormData) => {
 *     console.log(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <StringController
 *         name="name"
 *         control={control}
 *         render={(props) => (
 *           <TextField
 *             {...props}
 *             label="お名前"
 *             required
 *           />
 *         )}
 *       />
 *       <StringController
 *         name="email"
 *         control={control}
 *         render={(props) => (
 *           <TextField
 *             {...props}
 *             label="メールアドレス"
 *             type="email"
 *             required
 *           />
 *         )}
 *       />
 *       <button type="submit">送信</button>
 *     </form>
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * // バリデーションメッセージの国際化について
 * // Zodのカスタムエラーメッセージで国際化対応が可能です
 *
 * const schema = z.object({
 *   folderName: z
 *     .string()
 *     .min(1, { message: i18n.t(tKeys.validations.require) })
 *     .max(100, { message: i18n.t(tKeys.validations.maxLength) }),
 * });
 *
 * // StringControllerは自動的にこれらのエラーメッセージをhelperTextとして表示し、
 * // errorプロパティもtrueに設定されます
 * ```
 *
 * @example
 * ```tsx
 * // パスワードフィールドの実装
 * <StringController
 *   name="password"
 *   control={control}
 *   render={(props) => (
 *     <TextField
 *       {...props}
 *       label="パスワード"
 *       type="password"
 *       autoComplete="current-password"
 *       required
 *     />
 *   )}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // カスタムTextFieldコンポーネントの使用
 * import { CustomTextField } from './CustomTextField';
 *
 * <StringController
 *   name="customField"
 *   control={control}
 *   render={(props) => (
 *     <CustomTextField
 *       {...props}
 *       label="カスタムフィールド"
 *       variant="outlined"
 *     />
 *   )}
 * />
 * ```
 */
export const StringController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  render,
}: StringControllerProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) =>
        render({
          ...field,
          error: !!error,
          helperText: error?.message,
          size: 'small',
          fullWidth: true,
        })
      }
    />
  );
};
