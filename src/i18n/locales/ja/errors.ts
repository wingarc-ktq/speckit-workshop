export const errors = {
  title: {
    error: 'エラー',
  },
  general: {
    networkError:
      'ネットワークエラーが発生しました。ネットワーク接続をご確認ください。',
    unknownError: '不明なエラーが発生しました。',
  },
  auth: {
    invalidCredentials:
      'メールアドレス（またはユーザー名）またはパスワードが正しくありません。',
    noSession: 'セッションが存在しません。再度ログインしてください。',
    sessionExpired:
      'セッションの有効期限が切れました。再度ログインしてください。',
    networkError:
      '認証サーバーとの通信に失敗しました。しばらく時間をおいてから再度お試しください。',
  },
  http: {
    internalServerError:
      '現在システムが混雑しています。しばらく時間をおいてから再度お試しください。',
    badRequest: '不正なパラメータが送信されました。',
    notLoggedIn: 'ログインしていません。',
    forbidden:
      'この操作を行う権限がありません。問題が解消しない場合はブラウザをリロードしてください。',
    notFound: '対象が見つかりません。',
    payloadTooLarge: 'データ量の上限を超過しました。',
    serviceUnavailable:
      'サーバーが一時的に混雑しているか、メンテナンス中です。時間を空けて再度試してください。',
    gatewayTimeout: 'サーバーが時間内に応答しませんでした。',
  },
} as const;
