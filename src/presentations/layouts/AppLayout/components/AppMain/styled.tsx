import type React from 'react';

import Box, { type BoxProps } from '@mui/material/Box';
import Container, { type ContainerProps } from '@mui/material/Container';
import { styled } from '@mui/material/styles';

export const Main: React.FC<BoxProps> = styled(Box)<BoxProps>(({ theme }) => ({
  flexGrow: 1,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', // 画面全体の横スクロールを防ぐ
  minWidth: 0, // flex shrinkingを許可
  backgroundColor: theme.palette.action.hover,
}));

export const ContentArea: React.FC<BoxProps> = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  overflow: 'auto', // コンテンツエリア内でスクロール
  minWidth: 0, // flex shrinkingを許可
}));

export const PageContainer: React.FC<ContainerProps> = styled(Container)(
  () => ({})
);
