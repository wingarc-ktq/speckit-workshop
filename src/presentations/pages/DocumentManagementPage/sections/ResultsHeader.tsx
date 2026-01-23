import React from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SortControl } from '@/presentations/components';
import { SearchResultsStatus } from '@/presentations/components/search/SearchResultsStatus';

export interface ResultsHeaderProps {
  totalCount: number;
  displayCount: number;
  searchKeyword: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (by: string, order: 'asc' | 'desc') => void;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  totalCount,
  displayCount,
  searchKeyword,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  return (
    <Stack spacing={1}>
      <SearchResultsStatus totalCount={totalCount} searchKeyword={searchKeyword} isSearchActive={!!searchKeyword} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: '0.875rem', color: '#666' }}>{displayCount}件の文書</Typography>
        <SortControl
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => onSortChange(newSortBy, newSortOrder)}
        />
      </Box>
    </Stack>
  );
};
