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

---

## 2026-01-22

### 4. ファイル位置の変更

以下のファイル移動が行われました：

#### FileCardコンポーネントの共通化
- **コミット**: `cef79ca` (2026-01-22)
- **目的**: ページ固有コンポーネントから共通コンポーネント層への昇格
- **変更前**: `src/presentations/pages/FilesPage/components/RecentFilesSection/components/FileCard/`
- **変更後**: `src/presentations/components/cards/FileCard/`
- **対象ファイル**:
  - `FileCard.tsx`
  - `index.ts`
  - `styled.tsx`

**理由**: FileCardコンポーネントを複数のページで再利用可能にするため、共通コンポーネント層に移動

---

## 2026-01-23 テスト状況

### テスト実行結果

全テストがパスしていますが、以下の警告が出力されています。

#### 警告（Warning）

1. **PDF.js legacy build警告**
   - **対象ファイル**: 複数のテストファイル
   - **メッセージ**: `Warning: Please use the 'legacy' build in Node.js environments.`
   - **原因**: react-pdf/pdfjs-distがNode.js環境で非legacyビルドを使用している
   - **影響**: テスト自体は成功するが、警告が出力される

2. **React act() 警告**
   - **対象ファイル**: `src/presentations/hooks/__tests__/useFileSearch.test.ts`
   - **テストケース**: `検索クエリがデバウンスされた値としてuseFilesに渡される`
   - **メッセージ**: `An update to TestComponent inside a test was not wrapped in act(...)`
   - **原因**: 非同期状態更新がact()でラップされていない
   - **影響**: テストはパスするが、ベストプラクティスに従っていない

3. **HydrateFallback警告**
   - **対象ファイル**: `src/app/router/__tests__/routes.test.tsx`
   - **メッセージ**: `No 'HydrateFallback' element provided to render during initial hydration`
   - **影響**: React Router v7のSSR関連の警告

#### 確認されたエラー（テスト内で意図的にthrowされるもの）

以下のエラーはテスト内で**意図的に発生させている**エラーであり、エラーハンドリングのテストとして正常です：

| エラー種別 | テストファイル | 説明 |
|-----------|---------------|------|
| `WebApiException: Bad Request` | `PageWrapper.test.tsx` | エラーバウンダリのテスト用 |
| `WebApiException: UNAUTHORIZED` | `routes.test.tsx` | 認証エラー時の動作確認 |
| `NetworkException: Network error` | `routes.test.tsx` | ネットワークエラー時のCrashPage表示確認 |
| `Error: ページエラーが発生しました` | `routes.test.tsx` | RouteErrorBoundaryのテスト用 |

### テスト結果サマリー

- **ステータス**: 全テストパス ✓
- **テストスイート数**: 40+
- **総テスト数**: 200+