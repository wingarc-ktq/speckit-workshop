import React from 'react';

import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n';

interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactElement;
}

export const useMenuItems = (): MenuItem[] => {
  const { t } = useTranslation();

  return [
    { text: t(tKeys.navigation.dashboard), path: '/', icon: <DashboardIcon /> },
    { text: '文書管理', path: '/documents', icon: <DescriptionIcon /> },
  ];
};
