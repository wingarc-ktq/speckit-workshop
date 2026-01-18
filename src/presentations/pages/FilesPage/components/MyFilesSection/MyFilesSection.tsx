import React, { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';

import type { FileQueryParams } from '@/domain/models/file';
import { tKeys } from '@/i18n/tKeys';
import { useFiles } from '@/presentations/hooks/queries/files/useFiles';

import { EmptySearchResult, FileListTable } from './components';
import * as S from './styled';

import type { GridPaginationModel } from '@mui/x-data-grid';

interface MyFilesSectionProps {
  searchQuery?: string;
  tagIds?: string[];
}

export const MyFilesSection: React.FC<MyFilesSectionProps> = ({
  searchQuery,
  tagIds,
}) => {
  const { t } = useTranslation();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Convert MUI pagination model (0-based) to API params (1-based)
  const queryParams: FileQueryParams = {
    search: searchQuery,
    tagIds: tagIds && tagIds.length > 0 ? tagIds : undefined,
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  };

  const { data, isFetching } = useFiles(queryParams);

  const handlePaginationModelChange = useCallback(
    (newModel: GridPaginationModel) => {
      setPaginationModel(newModel);
    },
    []
  );

  const hasSearchQuery = !!searchQuery;
  const hasNoResults = !isFetching && data.files.length === 0 && hasSearchQuery;

  return (
    <S.Container data-testid="myFilesSection">
      <S.Title>{t(tKeys.filesPage.myFilesSection.title)}</S.Title>

      {hasNoResults ? (
        <EmptySearchResult />
      ) : (
        <FileListTable
          files={data.files ?? []}
          total={data.total ?? 0}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          selectedFileIds={selectedFileIds}
          onSelectionChange={setSelectedFileIds}
          loading={isFetching}
        />
      )}
    </S.Container>
  );
};
