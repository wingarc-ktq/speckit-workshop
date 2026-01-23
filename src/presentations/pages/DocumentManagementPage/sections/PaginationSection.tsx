import React from 'react';

import { DocumentPagination } from '@/presentations/components';

export interface PaginationSectionProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const PaginationSection: React.FC<PaginationSectionProps> = ({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <DocumentPagination
      currentPage={currentPage}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
};
