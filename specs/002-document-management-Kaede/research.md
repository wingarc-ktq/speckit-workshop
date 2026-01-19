# Research Findings: 文書管理システム

**Date**: 2025-01-14  
**Feature**: 文書管理システム  
**Research Tasks**: Figmaデザイン確認、ファイルアップロードベストプラクティス、既存認証統合、検索・フィルタリングUIパターン

## Decision: Figma Design Integration

**Rationale**: Figma URL (https://www.figma.com/make/nkPH2DKphetYyIBmoQaLic/Document-Management-System) からデザインを確認。Material-UIコンポーネントを使用したレスポンシブデザイン。アップロードエリアはドラッグ&ドロップ対応、ファイル一覧はグリッド/リストビュー切り替え可能。

**Alternatives considered**: カスタムCSS vs MUI - MUIを選択して一貫性とアクセシビリティを確保。

## Decision: File Upload Implementation

**Rationale**: React Dropzoneライブラリを使用。プログレスバーはMUI LinearProgress、複数ファイル同時アップロード対応。ファイルサイズ/形式バリデーションはクライアント側で事前チェック。

**Alternatives considered**: ネイティブinput vs Dropzone - Dropzoneを選択してUX向上。

## Decision: Auth Integration

**Rationale**: 既存001-user-authの認証フックを使用。ログイン状態に基づいて文書管理ページを表示。APIコールにAuthorizationヘッダーを自動付与。

**Alternatives considered**: 個別認証 vs 統合 - 統合を選択してコード重複を避ける。

## Decision: Search and Filtering UI

**Rationale**: MUI TextField for search, Chip for tags, DatePicker for date range. Debounced search (300ms) to reduce API calls. URL query params for state persistence.

**Alternatives considered**: 即時検索 vs Debounce - Debounceを選択してパフォーマンス最適化。

## Decision: Tag Management

**Rationale**: タグ作成/編集はダイアログ形式。色選択はMUI ColorPicker。タグ削除時は使用中確認ダイアログ。

**Alternatives considered**: インライン編集 vs ダイアログ - ダイアログを選択してシンプルさ維持。

## Decision: Document Preview

**Rationale**: PDF/画像はiframe/objectタグでプレビュー。ダウンロードは別タブで直接リンク。

**Alternatives considered**: Canvasレンダリング vs iframe - iframeを選択してシンプルさと互換性。

## Decision: State Management

**Rationale**: TanStack Query for server state (files, tags), React state for UI state (selected files, filters).

**Alternatives considered**: Redux vs TanStack Query - TanStack Queryを選択してサーバー状態管理の簡素化。

## Decision: Error Handling

**Rationale**: APIエラーはToast通知 (MUI Snackbar)。ネットワークエラー時は再試行ボタン。

**Alternatives considered**: Alertダイアログ vs Toast - Toastを選択して非侵入性。

## Decision: Testing Strategy

**Rationale**: Unit tests for hooks/utilities, Component tests for UI logic, E2E for critical flows (upload, search).

**Alternatives considered**: 手動テスト vs 自動テスト - 自動テストを選択して回帰防止。</content>
<parameter name="filePath">/home/kaepo/speckit-workshop/specs/002-document-management-Kaede/research.md

## Decision: Trash (Soft Delete) UX

**Rationale**:
誤削除を防ぐため、文書削除は即時完全削除せずゴミ箱へ移動する方式を採用する。
削除操作時には確認ダイアログを表示し、削除後はSnackbarで通知する。

ゴミ箱は通常の文書一覧とは分離した専用ページとし、
復元および完全削除を明示的な操作として提供する。

**Alternatives considered**:
- Undo のみ提供 → 状態管理が複雑なため不採用
