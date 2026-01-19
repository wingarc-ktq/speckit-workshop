import React from 'react';

import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  total,
  onPageChange,
  itemsPerPage = 20,
}) => {
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, total);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 0 },
        p: { xs: 1.5, md: 2 },
        borderTop: '1px solid #e5e7eb',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
        {startItem}-{endItem} / {total}件
      </Typography>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, value) => onPageChange(value)}
        color="primary"
        shape="rounded"
        size="small"
        siblingCount={{ xs: 0, sm: 1 }}
        boundaryCount={{ xs: 1, sm: 1 }}
      />
    </Box>
  );
};
