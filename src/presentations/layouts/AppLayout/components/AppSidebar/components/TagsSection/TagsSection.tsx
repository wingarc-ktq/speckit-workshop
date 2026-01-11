import React from 'react';

import AddIcon from '@mui/icons-material/Add';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n';

import { NavigationListItem } from '../shared';

import * as S from './styled';

interface TagItem {
  id: string;
  name: string;
  color: string;
}

export const TagsSection: React.FC = () => {
  const { t } = useTranslation();

  // サンプルデータ
  const tags: TagItem[] = [
    { id: '1', name: '請求書', color: '#0074e4' },
    { id: '2', name: '提案書', color: '#ff6b35' },
    { id: '3', name: '未処理', color: '#1ecb7f' },
    { id: '4', name: '完了', color: '#ff4081' },
  ];

  return (
    <S.SectionContainer data-testid="tagsSection">
      <S.HeaderWithButton>
        <S.SectionHeader>
          {t(tKeys.layouts.appSidebar.tags.title)}
        </S.SectionHeader>
        <IconButton size="small" data-testid="addTagButton">
          <AddIcon fontSize="small" />
        </IconButton>
      </S.HeaderWithButton>
      <List dense>
        {tags.map((tag) => (
          <NavigationListItem
            key={tag.id}
            icon={<SellOutlinedIcon sx={{ color: tag.color }} />}
            label={tag.name}
          />
        ))}
      </List>
    </S.SectionContainer>
  );
};
