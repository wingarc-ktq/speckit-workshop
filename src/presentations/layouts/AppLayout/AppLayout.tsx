import React from 'react';

import { Outlet } from 'react-router-dom';

import { PageWrapper } from './components';
import * as S from './styled';

export const AppLayout: React.FC = () => {
  return (
    <S.LayoutRoot>
      <S.MainContent>
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </S.MainContent>
    </S.LayoutRoot>
  );
};
