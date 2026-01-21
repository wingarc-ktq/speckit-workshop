import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import type { SelectChangeEvent } from '@mui/material/Select';

interface DocumentPaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * DocumentPagination コンポーネント
 * 文書一覧のページネーション機能
 *
 * @component
 * @example
 * ```tsx
 * <DocumentPagination
 *   currentPage={1}
 *   pageSize={20}
 *   totalCount={100}
 *   onPageChange={handlePageChange}
 *   onPageSizeChange={handlePageSizeChange}
 * />
 * ```
 */
export function DocumentPagination({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: DocumentPaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newPageSize: number = event.target.value as number;
    onPageSizeChange?.(newPageSize);
    // localStorage に保存
    localStorage.setItem('documentPageSize', String(newPageSize));
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mt: 3,
        pt: 2,
        borderTop: '1px solid #eee',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="textSecondary">
          {startIndex} - {endIndex} / 全 {totalCount} 件
        </Typography>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="page-size-label">1ページの件数</InputLabel>
          <Select
            labelId="page-size-label"
            value={pageSize}
            label="1ページの件数"
            onChange={handlePageSizeChange}
            data-testid="page-size-select"
          >
            <MenuItem value={10}>10 件</MenuItem>
            <MenuItem value={20}>20 件</MenuItem>
            <MenuItem value={50}>50 件</MenuItem>
            <MenuItem value={100}>100 件</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        data-testid="pagination-control"
      />
    </Box>
  );
}
