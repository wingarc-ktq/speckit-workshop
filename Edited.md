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

---

### 3. PDFプレビュー表示の実装

**問題**:
- ファイルの詳細表示画面でPDFを表示しようとすると、ブラウザの標準PDFビューアーで開かれてしまい、詳細表示画面内で正しく表示できなかった

**原因**:
- `<embed>`や`<iframe>`タグを使用してPDFを埋め込もうとすると、ブラウザのネイティブPDFビューアーが起動してしまう
- アプリケーション内で制御可能なPDFレンダリング機能が必要だった

**修正内容**:
- **react-pdf**ライブラリを使用してPDFプレビュー機能を実装
- `npm install react-pdf pdfjs-dist`でライブラリをインストール
- PDF.jsを使用してPDFをCanvasにレンダリングし、アプリケーション内で制御可能なプレビューを実現
- ファイル詳細表示画面で、PDFファイルが適切にプレビュー表示されるようになった

**メリット**:
- ブラウザに依存せず、統一されたPDF表示体験を提供
- ページナビゲーションやズーム機能などのカスタム制御が可能
- アプリケーション内でシームレスなUXを実現

---

## 今後の注意点

1. **生成されたAPIファイルの確認**: `src/adapters/generated/files.ts`は自動生成ファイルなので、インポートする際は実際のエクスポート名を確認する
2. **MSWのセットアップ**: 新しい環境でプロジェクトをセットアップする際は、`npx msw init public/`を実行してService Workerファイルを生成する必要がある
3. **PDFプレビュー**: PDFファイルのプレビュー表示にはreact-pdfライブラリを使用することで、ブラウザ依存の問題を回避できる