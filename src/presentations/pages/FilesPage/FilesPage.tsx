import React from 'react';

import {
  MyFilesSection,
  RecentFilesSection,
  UploadSection,
} from './components';
import * as S from './styled';

export const FilesPage: React.FC = () => {
  return (
    <S.Page data-testid="filesPage">
      <RecentFilesSection />
      <UploadSection />
      <MyFilesSection />
    </S.Page>
  );
};
