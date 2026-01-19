import React, { useRef } from 'react';

import { Outlet } from 'react-router-dom';

import {
  AppBreadcrumbs,
  AppHeader,
  AppMain,
  AppSidebar,
  PageWrapper,
  ResizableLayout,
  type ResizableLayoutRef,
} from './components';
import { DocumentHeaderProvider, useDocumentHeader } from './contexts';
import * as S from './styled';

const AppLayoutContent: React.FC = () => {
  const resizableLayoutRef = useRef<ResizableLayoutRef>(null);
  const documentHeader = useDocumentHeader();

  const handleMenuToggle = () => {
    resizableLayoutRef.current?.toggleDrawer();
  };

  return (
    <S.LayoutRoot>
      <AppHeader
        onMenuToggle={handleMenuToggle}
        showDocumentTools={documentHeader.showDocumentTools}
        onSearch={documentHeader.onSearch}
        onViewChange={documentHeader.onViewChange}
        onUploadClick={documentHeader.onUploadClick}
        onFilterClick={documentHeader.onFilterClick}
        currentView={documentHeader.currentView}
      />
      <ResizableLayout ref={resizableLayoutRef} sidebarContent={<AppSidebar />}>
        <AppMain>
          <AppBreadcrumbs />
          <PageWrapper>
            <Outlet />
          </PageWrapper>
        </AppMain>
      </ResizableLayout>
    </S.LayoutRoot>
  );
};

export const AppLayout: React.FC = () => {
  return (
    <DocumentHeaderProvider>
      <AppLayoutContent />
    </DocumentHeaderProvider>
  );
};
