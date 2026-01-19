import { Box, Container, Stack, Tabs, Tab } from '@mui/material';
import { useState, useEffect } from 'react';
import { useDocuments } from '@/presentations/hooks/queries';
import {
  FileUploadArea,
  FileList,
  FileGridView,
  ViewToggle,
  SortControl,
  DocumentPagination,
  DocumentEmptyState,
} from '@/presentations/components';

/**
 * DocumentManagementPage コンポーネント
 * 文書管理システムのメインページ
 * US1（アップロード）と US2（一覧表示・ソート・ページネーション）を統合
 */
export function DocumentManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // localStorage から設定を復元
  useEffect(() => {
    const savedView = localStorage.getItem('documentViewPreference') as 'list' | 'grid' | null;
    const savedPageSize = localStorage.getItem('documentPageSize');
    const savedSortBy = localStorage.getItem('documentSortBy');
    const savedSortOrder = localStorage.getItem('documentSortOrder') as 'asc' | 'desc' | null;

    if (savedView) setView(savedView);
    if (savedPageSize) setPageSize(parseInt(savedPageSize, 10));
    if (savedSortBy) setSortBy(savedSortBy);
    if (savedSortOrder) setSortOrder(savedSortOrder);
  }, []);

  // 文書一覧を取得
  const { data, isLoading, error } = useDocuments({
    page: currentPage,
    limit: pageSize,
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

  const documents = data?.data || [];
  const totalCount = data?.pagination.total || 0;

  return (
    <Container maxWidth="lg">
      <Stack spacing={3} sx={{ py: 4 }}>
        {/* ページタイトル */}
        <Box>
          <h1>文書管理</h1>
          <p>ファイルをアップロード、検索、管理してください。</p>
        </Box>

        {/* タブナビゲーション */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="文書管理タブ"
        >
          <Tab label="アップロード" />
          <Tab label="一覧" />
        </Tabs>

        {/* アップロードタブ */}
        {activeTab === 0 && (
          <Box>
            <FileUploadArea
              onUploadSuccess={() => {
                // アップロード完了後にタブを切り替える
                setActiveTab(1);
                setCurrentPage(1);
              }}
            />
          </Box>
        )}

        {/* 一覧タブ */}
        {activeTab === 1 && (
          <Stack spacing={3}>
            {/* ツールバー：表示切り替え、ソート */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <ViewToggle currentView={view} onViewChange={setView} />
              <SortControl sortBy={sortBy} sortOrder={sortOrder} onSortChange={setSortBy} />
            </Box>

            {/* 文書一覧またはグリッド */}
            {documents.length === 0 && !isLoading ? (
              <DocumentEmptyState
                onUploadClick={() => {
                  setActiveTab(0);
                }}
              />
            ) : view === 'list' ? (
              <FileList
                documents={documents}
                isLoading={isLoading}
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onSort={(by, order) => {
                  setSortBy(by);
                  setSortOrder(order);
                  setCurrentPage(1);
                }}
              />
            ) : (
              <FileGridView documents={documents} isLoading={isLoading} />
            )}

            {/* ページネーション */}
            {documents.length > 0 && (
              <DocumentPagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
