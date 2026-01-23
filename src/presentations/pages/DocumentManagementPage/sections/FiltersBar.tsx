import React from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import type { Document } from '@/domain/models/document';
import { FilterStatusBar } from '@/presentations/components/files/FilterStatusBar';

export interface FiltersBarProps {
  selectedTags: Document['tags'];
  startDate: string;
  endDate: string;
  onRemoveTag: (tagId: string) => void;
  onClearAll: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({ selectedTags, startDate, endDate, onRemoveTag, onClearAll }) => {
  const hasDateFilter = startDate || endDate;

  return (
    <Stack spacing={1}>
      <FilterStatusBar selectedTags={selectedTags} onRemoveTag={onRemoveTag} onClearAll={onClearAll} />
      {hasDateFilter ? (
        <Box sx={{ fontSize: '0.875rem', color: '#666' }}>アップロード日で絞り込み</Box>
      ) : null}
    </Stack>
  );
};
