import React from 'react';

import { LoginForm, LoginHeader } from './components';
import * as S from './styled';

export const LoginPage: React.FC = () => {
  return (
    <S.LoginContainer>
      <S.LoginCard>
        <LoginHeader />
        <LoginForm />
      </S.LoginCard>
    </S.LoginContainer>
  );
};
