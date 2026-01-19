import React from 'react';

import SearchOffIcon from '@mui/icons-material/SearchOff';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface FileSearchResultsProps {
  searchQuery: string;
  resultCount: number;
  isLoading?: boolean;
}

export const FileSearchResults: React.FC<FileSearchResultsProps> = ({
  searchQuery,
  resultCount,
  isLoading = false,
}) => {
  // 検索クエリがない場合は何も表示しない
  if (!searchQuery) {
    return null;
  }

  // ローディング中は何も表示しない
  if (isLoading) {
    return null;
  }

  // 検索結果がある場合
  if (resultCount > 0) {
    return (
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          「<strong>{searchQuery}</strong>」の検索結果: {resultCount}件
        </Typography>
      </Box>
    );
  }

  // 検索結果が0件の場合
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
      }}
    >
      <SearchOffIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        検索結果が見つかりません
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        「{searchQuery}」に一致するファイルが見つかりませんでした。
        <br />
        別のキーワードで検索してください。
      </Typography>
    </Box>
  );
};
