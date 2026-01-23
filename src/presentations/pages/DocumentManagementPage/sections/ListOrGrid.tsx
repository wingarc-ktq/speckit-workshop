import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Document } from '@/domain/models/document';
import {
  DocumentEmptyState,
  FileGridView,
  FileList,
} from '@/presentations/components';

export interface ListOrGridProps {
  view: 'list' | 'grid';
  documents: Document[];
  isLoading: boolean;
  searchKeyword: string;
  selectedTagIds: string[];
  startDate: string;
  endDate: string;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowClick: (doc: Document) => void;
  onCardClick: (doc: Document) => void;
  onSelectionChange: (ids: string[]) => void;
  onSort: (by: string, order: 'asc' | 'desc') => void;
  onUploadClick: () => void;
}

export const ListOrGrid: React.FC<ListOrGridProps> = ({
  view,
  documents,
  isLoading,
  searchKeyword,
  selectedTagIds,
  startDate,
  endDate,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onRowClick,
  onCardClick,
  onSelectionChange,
  onSort,
  onUploadClick,
}) => {
  const hasFilter = searchKeyword || selectedTagIds.length > 0 || startDate || endDate;

  if (documents.length === 0 && !isLoading) {
    if (hasFilter) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            backgroundColor: '#fafafa',
            borderRadius: 2,
            border: '2px dashed #ccc',
            gap: 2,
            p: 4,
          }}
        >
          <Typography variant="h6" sx={{ color: '#666' }}>
            該当する文書が見つかりませんでした
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', maxWidth: 300 }}>
            検索条件を変更して、再度お試しください。
          </Typography>
        </Box>
      );
    }

    return <DocumentEmptyState onUploadClick={onUploadClick} />;
  }

  if (view === 'list') {
    return (
      <FileList
        documents={documents}
        isLoading={isLoading}
        searchKeyword={searchKeyword}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onRowClick={onRowClick}
        onSelectionChange={onSelectionChange}
        onSort={(by, order) => {
          onSort(by, order);
          onPageChange(1);
        }}
      />
    );
  }

  return (
    <FileGridView
      documents={documents}
      isLoading={isLoading}
      searchKeyword={searchKeyword}
      onCardClick={onCardClick}
    />
  );
};
