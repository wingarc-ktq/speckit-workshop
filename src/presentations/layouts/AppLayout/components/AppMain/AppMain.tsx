import React from 'react';

import Toolbar from '@mui/material/Toolbar';

import * as S from './styled';

export interface AppContentsProps {
  children?: React.ReactNode;
}

export const AppMain: React.FC<AppContentsProps> = ({ children }) => {
  return (
    <S.Main component="main">
      <Toolbar />
      <S.ContentArea>
        <S.PageContainer>{children}</S.PageContainer>
      </S.ContentArea>
    </S.Main>
  );
};
