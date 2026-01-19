import { Box, Container, Skeleton, Stack } from '@mui/material';
import { useDocuments } from '@/presentations/hooks/queries/useDocuments';

/**
 * DocumentManagementPage コンポーネント
 * 文書管理システムのメインページ
 * US1, US2, US3 の機能を統合
 */
export function DocumentManagementPage() {
  // 文書一覧を取得
  const { data, isLoading, error } = useDocuments({
    page: 1,
    limit: 20,
  });

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: 1,
            }}
          >
            エラーが発生しました：{error.message}
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3} sx={{ py: 4 }}>
        {/* ページタイトル */}
        <Box>
          <h1>文書管理</h1>
          <p>ファイルをアップロード、検索、管理してください。</p>
        </Box>

        {/* ローディング状態 */}
        {isLoading && (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={100} />
            <Skeleton variant="rectangular" height={400} />
          </Stack>
        )}

        {/* データ表示 */}
        {!isLoading && data && (
          <Box>
            <p>文書数: {data.pagination.total}</p>
            {/* ここに FileUploadArea, SearchBar, ViewToggle などが入る */}
          </Box>
        )}
      </Stack>
    </Container>
  );
}
