import { useCallback, useState } from 'react';

import type { FileValidationOptions } from '@/domain/utils/fileValidation';
import { validateFiles } from '@/domain/utils/fileValidation';

export interface UseFileDragAndDropOptions extends FileValidationOptions {
  onFilesSelected?: (files: File[]) => void;
  onValidationError?: (errors: string[]) => void;
}

export function useFileDragAndDrop(options: UseFileDragAndDropOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);

      // バリデーション
      const validationResult = validateFiles(droppedFiles, {
        allowedTypes: options.allowedTypes,
        maxSize: options.maxSize,
        maxCount: options.maxCount,
      });

      if (!validationResult.valid) {
        options.onValidationError?.(validationResult.errors);
        return;
      }

      options.onFilesSelected?.(droppedFiles);
    },
    [options],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files ? Array.from(e.target.files) : [];

      if (selectedFiles.length === 0) return;

      // バリデーション
      const validationResult = validateFiles(selectedFiles, {
        allowedTypes: options.allowedTypes,
        maxSize: options.maxSize,
        maxCount: options.maxCount,
      });

      if (!validationResult.valid) {
        options.onValidationError?.(validationResult.errors);
        return;
      }

      options.onFilesSelected?.(selectedFiles);
      
      // ファイル入力をリセット（同じファイルを再選択できるようにする）
      e.target.value = '';
    },
    [options],
  );

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileInputChange,
  };
}
