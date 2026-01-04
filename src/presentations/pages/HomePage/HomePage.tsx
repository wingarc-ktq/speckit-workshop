import React from 'react';

import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n';

import * as S from './styled';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <S.Page>
      <S.HeaderSection>
        <Typography variant="h4" component="h1">
          {t(tKeys.homePage.title)}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t(tKeys.homePage.welcome)}
        </Typography>
      </S.HeaderSection>
      <S.OverviewCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t(tKeys.homePage.overview.title)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t(tKeys.homePage.overview.description)}
          </Typography>
        </CardContent>
      </S.OverviewCard>
    </S.Page>
  );
};
