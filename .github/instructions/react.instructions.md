---
applyTo: '**/*.{ts,tsx}'
---

# React/TypeScript開発ガイドライン

## ⚛️ 基本原則

- Props型は必ず`interface`で定義
- カスタムフックによるロジック分離
- MUIコンポーネントの個別インポート
- コンポーネントは`React.FC`を使用して型定義

## 📁 ファイル構成

```
MyComponent/
├── MyComponent.tsx         # メインコンポーネント
├── styled.tsx              # スタイル定義
├── index.ts                # エクスポート
├── hooks/                  # カスタムフック
└── __tests__/              # テストファイル
    └── MyComponent.test.tsx
```

## 🎨 コンポーネント作成

```typescript
// Props型は必ずinterfaceで定義
export interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  return <div>{title}</div>;
};
```

## 🎨 スタイリング

### MUIベースの段階的実装

1. **第1段階**: MUIのデフォルトコンポーネントで構築
2. **第2段階**: 基本的なpropsとMUIテーマ色でスタイリング調整
3. **第3段階**: styled.tsxでカスタムスタイリング（テーマ色優先）

### Figma MCP連携時のスタイル再現方針

- デザインの主要なレイアウト、配色、構造はFigmaに合わせる。
- px単位の余白・色・フォントサイズ・border-radiusなど、細かいスタイル指定は再現しない。
- MUIのデフォルトやテーマを優先し、必要最低限のカスタマイズに留める。
- 過度なCSS指定は避ける。
- 個別のスタイル分岐（例: theme.breakpoints）は避ける。

```typescript
// MyComponent.styled.tsx
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  // color: theme.palette.text.primary, // ← デフォルト値なので省略
}));

// ✅ 推奨: MUIテーマ色を使用
const StyledComponent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.text.secondary,
  borderColor: theme.palette.divider,
}));
```

## 🛡️ ルーティング

React Router v7を使用。Protected Routeで認証が必要なページを保護。

```typescript
// Protected Routeの使用例
{
  path: '/',
  lazy: async () => ({
    Component: () => (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
  }),
  children: [
    {
      index: true,
      lazy: async () => ({ Component: HomePage }),
    },
  ],
}
```

## 🌍 国際化

- 表示するテキストは基本的に`tKeys`から取得し、`useTypedTranslation`の`t`関数で表示する。
- 直接文字列は埋め込まない。

### NG例

```tsx
// NG: 直接日本語や英語などの文字列を埋め込むのはNG
export const MyComponent: React.FC = () => {
  return <div>Welcome to the homepage!</div>;
};
```

### OK例

```tsx
import { useTypedTranslation } from '@/i18n/hooks';

export const MyComponent: React.FC = () => {
  const { t, tKeys } = useTypedTranslation();

  return <div>{t(tKeys.homePage.title)}</div>;
};
```
