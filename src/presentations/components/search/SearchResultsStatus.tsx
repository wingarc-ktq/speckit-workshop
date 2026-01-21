import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface SearchResultsStatusProps {
  totalCount: number;
  searchKeyword?: string;
  isSearchActive: boolean;
}

/**
 * SearchResultsStatus コンポーネント
 * 検索結果の件数とキーワードを表示
 *
 * @component
 * @example
 * ```tsx
 * <SearchResultsStatus
 *   totalCount={10}
 *   searchKeyword="請求書"
 *   isSearchActive={true}
 * />
 * ```
 */
export function SearchResultsStatus({ totalCount, searchKeyword, isSearchActive }: SearchResultsStatusProps) {
  // 検索が有効でない場合は何も表示しない
  if (!isSearchActive || !searchKeyword) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 2,
        p: 1.5,
        backgroundColor: '#f5f5f5',
        borderRadius: 1,
        border: '1px solid #e0e0e0',
      }}
      data-testid="search-results-status"
    >
      <Typography variant="body2" sx={{ fontWeight: 500, color: '#666' }}>
        キーワード: <span style={{ fontWeight: 700, color: '#333' }}>「{searchKeyword}」</span>
      </Typography>
      <Typography variant="body2" sx={{ color: '#666' }}>
        •
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, color: '#666' }}>
        {totalCount === 0 ? (
          <span style={{ color: '#f44336' }}>該当する文書がありません</span>
        ) : (
          <>
            検索結果: <span style={{ fontWeight: 700, color: '#1976d2' }}>{totalCount}件</span>
          </>
        )}
      </Typography>
    </Box>
  );
}
