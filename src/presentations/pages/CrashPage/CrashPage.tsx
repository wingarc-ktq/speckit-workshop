import React from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n';
import { Logo } from '@/presentations/ui';

import * as S from './style';

export interface CrashPageProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export const CrashPage: React.FC<CrashPageProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const { t } = useTranslation();
  return (
    <S.Root data-testid="crashPage">
      <S.Main>
        <S.LogoArea>
          <Logo />
        </S.LogoArea>
        <S.ContentArea>
          <Typography variant="body1">{t(tKeys.crashPage.title)}</Typography>
          <S.ErrorMessage severity="error">{error.message}</S.ErrorMessage>
          <Button
            variant="outlined"
            color="primary"
            data-testid="reloadButton"
            onClick={resetErrorBoundary}
          >
            {t(tKeys.actions.reloadPage)}
          </Button>
        </S.ContentArea>
      </S.Main>
    </S.Root>
  );
};
