import React, { useCallback, useState } from 'react';

import DownloadIcon from '@mui/icons-material/Download';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

import type {
  DocumentFile,
  FileId,
  FileQueryParams,
} from '@/domain/models/file';
import { tKeys } from '@/i18n/tKeys';
import { FileDetailDialog } from '@/presentations/components';
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
  const [selectedFileId, setSelectedFileId] = useState<FileId | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

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

  const handleRowClick = useCallback((file: DocumentFile) => {
    setSelectedFileId(file.id);
    setIsDetailDialogOpen(true);
  }, []);

  const handleCloseDetailDialog = useCallback(() => {
    setIsDetailDialogOpen(false);
  }, []);

  const handleBulkDownload = useCallback(async () => {
    if (selectedFileIds.length === 0) return;

    const selectedFiles = data.files.filter((file) =>
      selectedFileIds.includes(file.id)
    );

    // 各ファイルを順番にダウンロード
    // 注: 実際のZIP化はバックエンドで行う想定
    // フロントエンドでは個別にダウンロードするか、バックエンドのZIPエンドポイントを呼び出す
    for (const file of selectedFiles) {
      window.open(file.downloadUrl, '_blank');
      // ブラウザのポップアップブロックを避けるため、少し待機
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }, [selectedFileIds, data.files]);

  const hasSearchQuery = !!searchQuery;
  const hasNoResults = !isFetching && data.files.length === 0 && hasSearchQuery;

  return (
    <S.Container data-testid="myFilesSection">
      <S.Header>
        <S.Title>{t(tKeys.filesPage.myFilesSection.title)}</S.Title>
        {selectedFileIds.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleBulkDownload}
          >
            {t(tKeys.filesPage.myFilesSection.bulkDownload, {
              count: selectedFileIds.length,
            })}
          </Button>
        )}
      </S.Header>

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
          onRowClick={handleRowClick}
          loading={isFetching}
        />
      )}

      <FileDetailDialog
        fileId={selectedFileId}
        open={isDetailDialogOpen}
        onClose={handleCloseDetailDialog}
      />
    </S.Container>
  );
};
