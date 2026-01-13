import React from 'react';

import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n/tKeys';
import { useFiles } from '@/presentations/hooks/queries/files/useFiles';

import { FileCard } from './components';
import * as S from './styled';

export const RecentFilesSection: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useFiles({ limit: 4 });

  const handleViewFile = (fileId: string) => {
    // TODO: Implement file view functionality
    console.log('View file:', fileId);
  };

  return (
    <S.Container data-testid="recentFilesSection">
      <S.Title>{t(tKeys.filesPage.recentFilesSection.title)}</S.Title>

      <S.FilesContainer>
        {data?.files.map((file) => (
          <FileCard key={file.id} file={file} onView={handleViewFile} />
        ))}
      </S.FilesContainer>
    </S.Container>
  );
};
