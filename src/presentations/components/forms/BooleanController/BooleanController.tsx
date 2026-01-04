import { type CheckboxProps } from '@mui/material/Checkbox';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

interface BooleanControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control: Control<TFieldValues>;
  render: (props: CheckboxProps) => React.ReactElement;
}

/**
 * react-hook-formのControllerを使用したブーリアン入力フィールドコンポーネント
 *
 * @description
 * - render propsパターンを採用し、任意のCheckboxコンポーネントをレンダリングできます
 * - ジェネリクスを使用して型安全性を保ちながら、チェックボックスの状態管理を自動で行います
 * - CheckboxPropsを通じて、checked状態が自動的に設定されます
 * - カスタムCheckboxコンポーネント（MUIベース、カスタムデザイン）の両方に対応可能
 *
 * @template TFieldValues - react-hook-formで管理するフォーム全体のデータ型（例: { agree: boolean, rememberMe: boolean }）
 * @template TName - フォーム内の特定フィールド名の型（TFieldValuesのキーから推論される）
 *
 * @param props - コンポーネントのプロパティ
 * @param props.name - フィールド名（フォームデータのキー）
 * @param props.control - react-hook-formのcontrolオブジェクト
 * @param props.render - CheckboxPropsを受け取り、Checkboxをレンダリングする関数
 *
 * @example
 * ```tsx
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 * import { z } from 'zod';
 * import Checkbox from '@mui/material/Checkbox';
 * import FormControlLabel from '@mui/material/FormControlLabel';
 * import { BooleanController } from '@/presentations/components/forms';
 *
 * // フォームのスキーマ定義
 * const agreementSchema = z.object({
 *   agreeToTerms: z.boolean().refine((val) => val === true, {
 *     message: '利用規約への同意が必要です',
 *   }),
 *   rememberMe: z.boolean().optional(),
 * });
 *
 * type AgreementFormData = z.infer<typeof agreementSchema>;
 *
 * export const AgreementForm = () => {
 *   const { control, handleSubmit } = useForm<AgreementFormData>({
 *     resolver: zodResolver(agreementSchema),
 *     defaultValues: {
 *       agreeToTerms: false,
 *       rememberMe: false,
 *     },
 *   });
 *
 *   const onSubmit = (data: AgreementFormData) => {
 *     console.log(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <BooleanController
 *         name="agreeToTerms"
 *         control={control}
 *         render={(props) => (
 *           <FormControlLabel
 *             control={<Checkbox {...props} />}
 *             label="利用規約に同意する"
 *           />
 *         )}
 *       />
 *       <BooleanController
 *         name="rememberMe"
 *         control={control}
 *         render={(props) => (
 *           <FormControlLabel
 *             control={<Checkbox {...props} />}
 *             label="ログイン状態を記憶する"
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
 *   agreeToTerms: z.boolean().refine((val) => val === true, {
 *     message: i18n.t(tKeys.validations.mustAgree),
 *   }),
 * });
 *
 * // エラーがある場合、FormControlLabelのerrorプロパティで表示できます
 * ```
 *
 * @example
 * ```tsx
 * // エラー表示付きのチェックボックス実装
 * <BooleanController
 *   name="agreeToTerms"
 *   control={control}
 *   render={(props) => (
 *     <FormControl error={!!errors.agreeToTerms}>
 *       <FormControlLabel
 *         control={<Checkbox {...props} />}
 *         label="利用規約に同意する"
 *       />
 *       {errors.agreeToTerms && (
 *         <FormHelperText>{errors.agreeToTerms.message}</FormHelperText>
 *       )}
 *     </FormControl>
 *   )}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // カスタムCheckboxコンポーネントの使用
 * import { CustomCheckbox } from './CustomCheckbox';
 *
 * <BooleanController
 *   name="customField"
 *   control={control}
 *   render={(props) => (
 *     <FormControlLabel
 *       control={<CustomCheckbox {...props} color="primary" />}
 *       label="カスタムチェックボックス"
 *     />
 *   )}
 * />
 * ```
 */
export const BooleanController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  render,
}: BooleanControllerProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, ...field } }) =>
        render({
          ...field,
          checked: !!value,
        })
      }
    />
  );
};
