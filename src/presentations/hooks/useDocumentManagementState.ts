import { useState, useCallback } from 'react';

export type ViewMode = 'list' | 'grid';
export type SortBy = 'name' | 'uploadedAt' | 'size';
export type SortOrder = 'asc' | 'desc';

interface DocumentManagementState {
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  selectedTags: string[];
  dateFrom?: Date;
  dateTo?: Date;
  isUploadDialogOpen: boolean;
}

interface DocumentManagementActions {
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sortBy: SortBy) => void;
  toggleSortOrder: () => void;
  setSearchQuery: (query: string) => void;
  toggleTag: (tagId: string) => void;
  clearTags: () => void;
  setDateFrom: (date?: Date) => void;
  setDateTo: (date?: Date) => void;
  openUploadDialog: () => void;
  closeUploadDialog: () => void;
}

export const useDocumentManagementState = (): [
  DocumentManagementState,
  DocumentManagementActions
] => {
  const [state, setState] = useState<DocumentManagementState>({
    viewMode: 'list',
    sortBy: 'uploadedAt',
    sortOrder: 'desc',
    searchQuery: '',
    selectedTags: [],
    isUploadDialogOpen: false,
  });

  const setViewMode = useCallback((mode: ViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const setSortBy = useCallback((sortBy: SortBy) => {
    setState((prev) => ({ ...prev, sortBy }));
  }, []);

  const toggleSortOrder = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const toggleTag = useCallback((tagId: string) => {
    setState((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter((t) => t !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  }, []);

  const clearTags = useCallback(() => {
    setState((prev) => ({ ...prev, selectedTags: [] }));
  }, []);

  const setDateFrom = useCallback((date?: Date) => {
    setState((prev) => ({ ...prev, dateFrom: date }));
  }, []);

  const setDateTo = useCallback((date?: Date) => {
    setState((prev) => ({ ...prev, dateTo: date }));
  }, []);

  const openUploadDialog = useCallback(() => {
    setState((prev) => ({ ...prev, isUploadDialogOpen: true }));
  }, []);

  const closeUploadDialog = useCallback(() => {
    setState((prev) => ({ ...prev, isUploadDialogOpen: false }));
  }, []);

  return [
    state,
    {
      setViewMode,
      setSortBy,
      toggleSortOrder,
      setSearchQuery,
      toggleTag,
      clearTags,
      setDateFrom,
      setDateTo,
      openUploadDialog,
      closeUploadDialog,
    },
  ];
};
