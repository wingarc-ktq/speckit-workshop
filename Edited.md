# 修正ログ

このファイルは、プロジェクトで行った修正内容を記録するためのドキュメントです。

## 2026-01-19

### 1. インポートエラーの修正

**問題**:
```
getFile.ts:3 Uncaught SyntaxError: The requested module '/src/adapters/generated/files.ts'
does not provide an export named 'getFile'
```

**原因**:
- `src/adapters/repositories/files/getFile.ts`で存在しないエクスポート`getFile`をインポートしようとしていた
- 生成されたAPIファイル(`src/adapters/generated/files.ts`)には`getFileById`という名前でエクスポートされている

**修正内容**:
- ファイル: `src/adapters/repositories/files/getFile.ts:3`
- 変更前: `import { getFile as getFileApi } from '@/adapters/generated/files';`
- 変更後: `import { getFileById as getFileApi } from '@/adapters/generated/files';`

---

### 2. MSW (Mock Service Worker) 初期化エラーの修正

**問題**:
```
🔶 MSW初期化エラー: Failed to register the Service Worker:
The script has an unsupported MIME type ('text/html').
```

**原因**:
- `mockServiceWorker.js`ファイルが`public/`ディレクトリに存在していなかった
- そのため404エラーでHTMLが返され、Service Workerとして登録できなかった

**修正内容**:
```bash
npx msw init public/ --save
```
- MSWのService Workerファイルを`public/`ディレクトリに生成

**副次的な効果**:
- このエラーが原因で、認証APIへのリクエストがモックでインターセプトされず、実際の`localhost:3000`へリクエストが飛んでいた
- バックエンドサーバーが起動していないため`ERR_CONNECTION_REFUSED`が発生していた
- MSWの初期化により、これらの認証エラーも解消

---

## 今後の注意点

1. **生成されたAPIファイルの確認**: `src/adapters/generated/files.ts`は自動生成ファイルなので、インポートする際は実際のエクスポート名を確認する
2. **MSWのセットアップ**: 新しい環境でプロジェクトをセットアップする際は、`npx msw init public/`を実行してService Workerファイルを生成する必要がある