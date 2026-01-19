import React, { createContext, useContext, useState, useCallback } from 'react';

interface DocumentHeaderContextValue {
  showDocumentTools: boolean;
  searchKeyword: string;
  currentView: 'list' | 'grid';
  setShowDocumentTools: (show: boolean) => void;
  setSearchKeyword: (keyword: string) => void;
  setCurrentView: (view: 'list' | 'grid') => void;
  onSearch?: (keyword: string) => void;
  onViewChange?: (view: 'list' | 'grid') => void;
  onUploadClick?: () => void;
  onFilterClick?: () => void;
  registerCallbacks: (callbacks: {
    onSearch?: (keyword: string) => void;
    onViewChange?: (view: 'list' | 'grid') => void;
    onUploadClick?: () => void;
    onFilterClick?: () => void;
  }) => void;
}

const DocumentHeaderContext = createContext<DocumentHeaderContextValue | undefined>(undefined);

export const DocumentHeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showDocumentTools, setShowDocumentTools] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');
  const [callbacks, setCallbacks] = useState<{
    onSearch?: (keyword: string) => void;
    onViewChange?: (view: 'list' | 'grid') => void;
    onUploadClick?: () => void;
    onFilterClick?: () => void;
  }>({});

  const registerCallbacks = useCallback((newCallbacks: typeof callbacks) => {
    setCallbacks(newCallbacks);
  }, []);

  return (
    <DocumentHeaderContext.Provider
      value={{
        showDocumentTools,
        searchKeyword,
        currentView,
        setShowDocumentTools,
        setSearchKeyword,
        setCurrentView,
        onSearch: callbacks.onSearch,
        onViewChange: callbacks.onViewChange,
        onUploadClick: callbacks.onUploadClick,
        onFilterClick: callbacks.onFilterClick,
        registerCallbacks,
      }}
    >
      {children}
    </DocumentHeaderContext.Provider>
  );
};

export const useDocumentHeader = () => {
  const context = useContext(DocumentHeaderContext);
  if (!context) {
    throw new Error('useDocumentHeader must be used within DocumentHeaderProvider');
  }
  return context;
};
