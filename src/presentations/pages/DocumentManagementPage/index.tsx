import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

import type { Document } from '@/domain/models/document';
import { SelectionToolbar } from '@/presentations/components';
import { useDocuments, useTagFilter, useTags } from '@/presentations/hooks/queries';

import { DetailsDialog } from './dialogs/DetailsDialog';
import { FilterDialog } from './dialogs/FilterDialog';
import { UploadDialog } from './dialogs/UploadDialog';
import { useHeaderControls } from './hooks/useHeaderControls';
import { FiltersBar } from './sections/FiltersBar';
import { ListOrGrid } from './sections/ListOrGrid';
import { PaginationSection } from './sections/PaginationSection';
import { ResultsHeader } from './sections/ResultsHeader';

export const DocumentManagementPage: React.FC = () => {
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
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const { selectedTagIds, setTagIds, clearTagIds } = useTagFilter();
  const { data: allTags } = useTags();

  const selectedTags = useMemo(() => {
    if (!allTags) return [];
    return allTags.filter((tag) => selectedTagIds.includes(tag.id));
  }, [allTags, selectedTagIds]);

  const handleOpenUploadDialog = useCallback(() => setShowUploadDialog(true), []);
  const handleOpenFilterDialog = useCallback(() => setShowFilterDialog(true), []);

  useHeaderControls({
    view,
    onSearch: setSearchKeyword,
    onViewChange: setView,
    onUploadClick: handleOpenUploadDialog,
    onFilterClick: handleOpenFilterDialog,
  });

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

  const { data, isLoading, error } = useDocuments({
    page: currentPage,
    limit: pageSize,
    search: searchKeyword,
    tagIds: selectedTagIds,
    sortBy,
    sortOrder,
  });

  const documents = useMemo(() => data?.data || [], [data?.data]);

  const tagCounts = useMemo(() => {
    return documents.reduce<Record<string, number>>((acc, doc) => {
      doc.tags.forEach((tag) => {
        acc[tag.id] = (acc[tag.id] || 0) + 1;
      });
      return acc;
    }, {});
  }, [documents]);

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

  const totalCount = data?.pagination.total || 0;

  return (
    <Container 
      maxWidth="lg"
      sx={{
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Stack spacing={2} sx={{ py: 3 }}>
        <UploadDialog
          open={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onUploadSuccess={() => setCurrentPage(1)}
        />

        <FilterDialog
          open={showFilterDialog}
          onClose={() => setShowFilterDialog(false)}
          selectedTagIds={selectedTagIds}
          tagCounts={tagCounts}
          startDate={startDate}
          endDate={endDate}
          onTagsChange={setTagIds}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <DetailsDialog
          open={!!selectedDocument}
          documentId={selectedDocument?.id}
          onClose={() => {
            setSelectedDocument(null);
          }}
        />

        <Stack spacing={2}>
          <ResultsHeader
            totalCount={totalCount}
            displayCount={documents.length}
            searchKeyword={searchKeyword}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(newSortBy, newSortOrder) => {
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              setCurrentPage(1);
            }}
          />

          <SelectionToolbar
            selectedCount={selectedDocumentIds.length}
            onDelete={() => {
              // 削除処理（将来実装）
              console.log('Delete selected:', selectedDocumentIds);
            }}
            onDownload={() => {
              // 一括ダウンロード処理（将来実装）
              console.log('Download selected:', selectedDocumentIds);
            }}
            onClearSelection={() => {
              setSelectedDocumentIds([]);
            }}
          />

          <FiltersBar
            selectedTags={selectedTags}
            startDate={startDate}
            endDate={endDate}
            onRemoveTag={(tagId) => {
              setTagIds(selectedTagIds.filter((id) => id !== tagId));
            }}
            onClearAll={clearTagIds}
          />

          <ListOrGrid
            view={view}
            documents={documents}
            isLoading={isLoading}
            searchKeyword={searchKeyword}
            selectedTagIds={selectedTagIds}
            startDate={startDate}
            endDate={endDate}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onRowClick={(doc) => {
              setSelectedDocument(doc);
            }}
            onCardClick={(doc) => {
              setSelectedDocument(doc);
            }}
            onSelectionChange={setSelectedDocumentIds}
            onSort={(by, order) => {
              setSortBy(by);
              setSortOrder(order);
              setCurrentPage(1);
            }}
            onUploadClick={handleOpenUploadDialog}
          />

          {documents.length > 0 ? (
            <PaginationSection
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          ) : null}
        </Stack>
      </Stack>
    </Container>
  );
};
