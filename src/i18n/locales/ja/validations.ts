export const validations = {
  require: '必須項目です',
  invalidEmail: '有効なメールアドレスを入力してください',
  minLength: '{{min}}文字以上で入力してください',
  maxLength: '{{max}}文字以内で入力してください',
  eitherEmailOrUsername:
    'メールアドレスまたはユーザー名のいずれかを入力してください',
} as const;
