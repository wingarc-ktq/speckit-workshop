import React from 'react';

import { UploadSection } from './components';
import * as S from './styled';

export const FilesPage: React.FC = () => {
  return (
    <S.Page data-testid="filesPage">
      <UploadSection />
    </S.Page>
  );
};
