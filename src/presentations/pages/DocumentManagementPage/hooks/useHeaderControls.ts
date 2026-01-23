import { useEffect } from 'react';

import { useDocumentHeader } from '@/presentations/layouts/AppLayout/contexts';

interface HeaderControlOptions {
  view: 'list' | 'grid';
  onSearch: (keyword: string) => void;
  onViewChange: (view: 'list' | 'grid') => void;
  onUploadClick: () => void;
  onFilterClick: () => void;
}

export const useHeaderControls = (options: HeaderControlOptions): void => {
  const { setShowDocumentTools, registerCallbacks, setCurrentView } = useDocumentHeader();

  useEffect(() => {
    setShowDocumentTools(true);
    registerCallbacks({
      onSearch: options.onSearch,
      onViewChange: options.onViewChange,
      onUploadClick: options.onUploadClick,
      onFilterClick: options.onFilterClick,
    });

    return () => {
      setShowDocumentTools(false);
    };
  }, [
    options.onFilterClick,
    options.onSearch,
    options.onUploadClick,
    options.onViewChange,
    registerCallbacks,
    setShowDocumentTools,
  ]);

  useEffect(() => {
    setCurrentView(options.view);
  }, [options.view, setCurrentView]);
};
