import React from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { tKeys } from '@/i18n';

import * as S from './styled';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoHome = () => {
    void navigate('/');
  };

  const handleGoBack = () => {
    void navigate(-1);
  };

  return (
    <S.NotFoundContainer>
      <S.ContentBox>
        <S.ErrorIconContainer>
          <S.ErrorNumber>404</S.ErrorNumber>
        </S.ErrorIconContainer>

        <S.ErrorTitle>{t(tKeys.notFoundPage.title)}</S.ErrorTitle>

        <S.ErrorDescription>
          {t(tKeys.notFoundPage.description)}
        </S.ErrorDescription>

        <S.ActionBox>
          <S.HomeButton
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
          >
            {t(tKeys.notFoundPage.actions.goHome)}
          </S.HomeButton>

          <S.BackButton
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            {t(tKeys.notFoundPage.actions.goBack)}
          </S.BackButton>
        </S.ActionBox>

        {/* 装飾的な要素 */}
        <S.FloatingDecoration1 />
        <S.FloatingDecoration2 />
      </S.ContentBox>
    </S.NotFoundContainer>
  );
};
