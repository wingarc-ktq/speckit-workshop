import { useState, useCallback, useEffect } from 'react';

interface UseDrawerProps {
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
}

interface UseDrawerReturn {
  drawerOpen: boolean;
  drawerWidth: number;
  toggleDrawer: () => void;
  handleResizeDrawer: (width: number) => void;
}

export const useDrawer = ({
  minWidth,
  maxWidth,
  defaultWidth,
}: UseDrawerProps): UseDrawerReturn => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerWidth, setDrawerWidth] = useState(defaultWidth);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const handleResizeDrawer = useCallback(
    (newWidth: number) => {
      // 範囲内の場合のみ更新
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setDrawerWidth(newWidth);
      }
    },
    [minWidth, maxWidth]
  );

  // maxWidthが変更された場合、現在の幅を調整
  useEffect(() => {
    setDrawerWidth((currentWidth) =>
      currentWidth > maxWidth ? maxWidth : currentWidth
    );
  }, [maxWidth]);

  return {
    drawerOpen,
    drawerWidth,
    toggleDrawer,
    handleResizeDrawer,
  };
};
