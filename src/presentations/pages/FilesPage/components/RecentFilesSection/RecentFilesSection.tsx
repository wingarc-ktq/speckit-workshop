import React, { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';

import type { FileId } from '@/domain/models/file';
import { tKeys } from '@/i18n/tKeys';
import { FileCard, FileDetailDialog } from '@/presentations/components';
import { useFiles } from '@/presentations/hooks/queries/files/useFiles';

import * as S from './styled';

export const RecentFilesSection: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useFiles({ limit: 4 });
  const [selectedFileId, setSelectedFileId] = useState<FileId | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleViewFile = useCallback((fileId: string) => {
    setSelectedFileId(fileId);
    setIsDetailDialogOpen(true);
  }, []);

  const handleCloseDetailDialog = useCallback(() => {
    setIsDetailDialogOpen(false);
  }, []);

  return (
    <S.Container data-testid="recentFilesSection">
      <S.Title>{t(tKeys.filesPage.recentFilesSection.title)}</S.Title>

      <S.FilesContainer>
        {data?.files.map((file) => (
          <FileCard key={file.id} file={file} onView={handleViewFile} />
        ))}
      </S.FilesContainer>

      <FileDetailDialog
        fileId={selectedFileId}
        open={isDetailDialogOpen}
        onClose={handleCloseDetailDialog}
      />
    </S.Container>
  );
};
