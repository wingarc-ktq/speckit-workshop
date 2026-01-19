import { Box, Container, Stack, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import type { Document } from '@/domain/models/document';
import { useDocuments, useTagFilter, useTags } from '@/presentations/hooks/queries';
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
  FileDetailsModal,
} from '@/presentations/components';
import { FilterStatusBar } from '@/presentations/components/files/FilterStatusBar';
import { SearchResultsStatus } from '@/presentations/components/search/SearchResultsStatus';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { selectedTagIds, setTagIds, clearTagIds } = useTagFilter();
  const { data: allTags } = useTags();

  const selectedTags = useMemo(() => {
    if (!allTags) return [];
    return allTags.filter((tag) => selectedTagIds.includes(tag.id));
  }, [allTags, selectedTagIds]);

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
    tagIds: selectedTagIds,
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
                onTagsChange={setTagIds}
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

        {/* 文書詳細モーダル */}
        {selectedDocument && (
          <FileDetailsModal
            open={showDetailsModal}
            documentId={selectedDocument.id}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedDocument(null);
            }}
          />
        )}

        {/* 一覧表示 - Figmaデザイン準拠 */}
        <Stack spacing={2}>
          {/* 検索結果ステータス */}
          <SearchResultsStatus
            totalCount={totalCount}
            searchKeyword={searchKeyword}
            isSearchActive={!!searchKeyword}
          />

          {/* タグフィルター状態バー */}
          <FilterStatusBar
            selectedTags={selectedTags}
            onRemoveTag={(tagId) => {
              setTagIds(selectedTagIds.filter((id) => id !== tagId));
            }}
            onClearAll={clearTagIds}
          />

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
              searchKeyword={searchKeyword}
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onRowClick={(doc) => {
                setSelectedDocument(doc);
                setShowDetailsModal(true);
              }}
              onSort={(by, order) => {
                setSortBy(by);
                setSortOrder(order);
                setCurrentPage(1);
              }}
            />
          ) : (
            <FileGridView 
              documents={documents} 
              isLoading={isLoading} 
              searchKeyword={searchKeyword}
              onCardClick={(doc) => {
                setSelectedDocument(doc);
                setShowDetailsModal(true);
              }}
            />
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
