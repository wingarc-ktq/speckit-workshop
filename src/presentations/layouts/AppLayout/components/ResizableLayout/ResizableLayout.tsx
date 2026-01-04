import React, { useImperativeHandle, forwardRef, useCallback } from 'react';

import { useDrawer, useWindowSize } from './hooks';
import * as S from './styled';

const DRAWER_MIN_WIDTH = 220;
const DRAWER_DEFAULT_WIDTH = 240;

interface ResizableLayoutProps {
  sidebarContent: React.ReactNode;
  children: React.ReactNode;
}

export interface ResizableLayoutRef {
  toggleDrawer: () => void;
}

export const ResizableLayout = forwardRef<
  ResizableLayoutRef,
  ResizableLayoutProps
>(({ sidebarContent, children }, ref) => {
  const { width: windowWidth } = useWindowSize();
  const drawerMaxWidth = Math.floor(windowWidth / 2);

  const { drawerOpen, drawerWidth, toggleDrawer, handleResizeDrawer } =
    useDrawer({
      minWidth: DRAWER_MIN_WIDTH,
      maxWidth: drawerMaxWidth,
      defaultWidth: DRAWER_DEFAULT_WIDTH,
    });

  useImperativeHandle(
    ref,
    () => ({
      toggleDrawer,
    }),
    [toggleDrawer]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      const startX = e.clientX;
      const startWidth = drawerWidth;

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = startWidth + deltaX;
        handleResizeDrawer(newWidth);
      };

      const handleMouseUp = () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [drawerWidth, handleResizeDrawer]
  );

  return (
    <S.ResizableContainer>
      <S.SidebarWrapper open={drawerOpen} width={drawerWidth}>
        {sidebarContent}
      </S.SidebarWrapper>
      {drawerOpen && (
        <S.ResizeHandle
          data-testid="resizeHandle"
          onMouseDown={handleResizeStart}
        />
      )}
      {children}
    </S.ResizableContainer>
  );
});
