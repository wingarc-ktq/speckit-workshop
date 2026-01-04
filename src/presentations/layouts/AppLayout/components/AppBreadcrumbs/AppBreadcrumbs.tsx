import React from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import type { Breadcrumb } from '@/app/types';
import { tKeys } from '@/i18n';

import { useMenuItems } from '../../hooks';

import * as S from './styled';

export const AppBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const menuItems = useMenuItems();

  const getBreadcrumbs = (): Breadcrumb[] => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs: Breadcrumb[] = [
      { label: t(tKeys.navigation.home), path: '/' },
    ];

    let currentPath = '';
    pathnames.forEach((pathname) => {
      currentPath += `/${pathname}`;
      const menuItem = menuItems.find((item) => item.path === currentPath);
      if (menuItem) {
        breadcrumbs.push({ label: menuItem.text, path: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <S.NavigationBreadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
      {breadcrumbs.map((breadcrumb, index) =>
        index === breadcrumbs.length - 1 ? (
          <Typography key={breadcrumb.path} color="text.primary">
            {breadcrumb.label}
          </Typography>
        ) : (
          <Link
            key={breadcrumb.path}
            component={RouterLink}
            to={breadcrumb.path}
            color="inherit"
            underline="hover"
          >
            {breadcrumb.label}
          </Link>
        )
      )}
    </S.NavigationBreadcrumbs>
  );
};
