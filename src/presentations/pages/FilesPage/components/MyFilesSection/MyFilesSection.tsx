import React, { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';

import type { FileQueryParams } from '@/domain/models/file';
import { tKeys } from '@/i18n/tKeys';
import { useFiles } from '@/presentations/hooks/queries/files/useFiles';

import { FileListTable } from './components';
import * as S from './styled';

import type { GridPaginationModel } from '@mui/x-data-grid';

export const MyFilesSection: React.FC = () => {
  const { t } = useTranslation();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Convert MUI pagination model (0-based) to API params (1-based)
  const queryParams: FileQueryParams = {
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

  return (
    <S.Container data-testid="myFilesSection">
      <S.Title>{t(tKeys.filesPage.myFilesSection.title)}</S.Title>

      <FileListTable
        files={data.files ?? []}
        total={data.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        selectedFileIds={selectedFileIds}
        onSelectionChange={setSelectedFileIds}
        loading={isFetching}
      />
    </S.Container>
  );
};
