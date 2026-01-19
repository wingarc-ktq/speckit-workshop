import { Box, Container, Stack, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useState, useEffect } from 'react';
import { useDocuments } from '@/presentations/hooks/queries';
import { useDocumentHeader } from '@/presentations/layouts/AppLayout/contexts';
import {
  FileUploadArea,
  FileList,
  FileGridView,
  SortControl,
  DocumentPagination,
  DocumentEmptyState,
  DateRangeFilter,
  TagFilter,
} from '@/presentations/components';

/**
 * DocumentManagementPage コンポーネント
 * 文書管理システムのメインページ
 * US1（アップロード）と US2（一覧表示・ソート・ページネーション）を統合
 */
export function DocumentManagementPage() {
  const documentHeader = useDocumentHeader();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // ヘッダーツールを有効化し、コールバックを登録
  useEffect(() => {
    documentHeader.setShowDocumentTools(true);
    documentHeader.registerCallbacks({
      onSearch: setSearchKeyword,
      onViewChange: setView,
      onUploadClick: () => setShowUploadDialog(true),
      onFilterClick: () => setShowFilterDialog(true),
    });

    return () => {
      documentHeader.setShowDocumentTools(false);
    };
  }, []);

  // localStorage から設定を復元
  useEffect(() => {
    const savedView = localStorage.getItem('documentViewPreference') as 'list' | 'grid' | null;
    const savedPageSize = localStorage.getItem('documentPageSize');
    const savedSortBy = localStorage.getItem('documentSortBy');
    const savedSortOrder = localStorage.getItem('documentSortOrder') as 'asc' | 'desc' | null;

    if (savedView) {
      setView(savedView);
      documentHeader.setCurrentView(savedView);
    }
    if (savedPageSize) setPageSize(parseInt(savedPageSize, 10));
    if (savedSortBy) setSortBy(savedSortBy);
    if (savedSortOrder) setSortOrder(savedSortOrder);
  }, []);

  // ビューが変更されたらlocalStorageとヘッダーを更新
  useEffect(() => {
    documentHeader.setCurrentView(view);
  }, [view]);

  // 文書一覧を取得
  const { data, isLoading, error } = useDocuments({
    page: currentPage,
    limit: pageSize,
    search: searchKeyword,
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
      <Stack spacing={2} sx={{ py: 3 }}>


        {/* アップロードダイアログ */}
        <Dialog
          open={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>ファイルアップロード</DialogTitle>
          <DialogContent>
            <FileUploadArea
              onUploadSuccess={() => {
                setShowUploadDialog(false);
                setCurrentPage(1);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* フィルターダイアログ */}
        <Dialog
          open={showFilterDialog}
          onClose={() => setShowFilterDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>絞り込み</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              {/* タグフィルター */}
              <TagFilter
                selectedTagIds={selectedTagIds}
                onTagsChange={setSelectedTagIds}
              />

              {/* 日付フィルター */}
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </Stack>
          </DialogContent>
        </Dialog>

        {/* 一覧表示 - Figmaデザイン準拠 */}
        <Stack spacing={2}>
          {/* アップロード日で絞り込み表示 */}
          {(startDate || endDate) && (
            <Box sx={{ fontSize: '0.875rem', color: '#666' }}>
              アップロード日で絞り込み
            </Box>
          )}

          {/* ドキュメント件数表示 */}
          <Box sx={{ fontSize: '0.875rem', color: '#666' }}>
            {documents.length}件の文書
          </Box>

          {/* ツールバー：ソート */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <SortControl sortBy={sortBy} sortOrder={sortOrder} onSortChange={setSortBy} />
          </Box>

          {/* 文書一覧またはグリッド */}
          {documents.length === 0 && !isLoading ? (
            <DocumentEmptyState
              onUploadClick={() => {
                setShowUploadDialog(true);
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
      </Stack>
    </Container>
  );
}
