import React from 'react';

import { Outlet } from 'react-router-dom';

import { AppHeader } from '../../components';
import { PageWrapper } from './components';
import * as S from './styled';

export const AppLayout: React.FC = () => {
  return (
    <S.LayoutRoot>
      <AppHeader />
      <S.MainContent>
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </S.MainContent>
    </S.LayoutRoot>
  );
};
