export interface FileValidationError {
  fileName: string;
  error: string;
}

export const SUPPORTED_FORMATS = ['pdf', 'docx', 'xlsx', 'jpg', 'jpeg', 'png'] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_UPLOAD = 20;

/**
 * ファイル形式を検証
 */
export function validateFileFormat(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension ? SUPPORTED_FORMATS.includes(extension as any) : false;
}

/**
 * ファイルサイズを検証
 */
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * 複数ファイルの個数を検証
 */
export function validateFileCount(files: File[]): boolean {
  return files.length <= MAX_FILES_PER_UPLOAD;
}

/**
 * 単一ファイルを検証
 */
export function validateSingleFile(file: File): FileValidationError | null {
  if (!validateFileFormat(file)) {
    return {
      fileName: file.name,
      error: 'サポートされていないファイル形式です（PDF、DOCX、XLSX、JPG、PNG のみ対応）',
    };
  }

  if (!validateFileSize(file)) {
    return {
      fileName: file.name,
      error: 'ファイルサイズは10MB以下にしてください',
    };
  }

  return null;
}

/**
 * 複数ファイルを検証
 */
export function validateFiles(files: File[]): FileValidationError[] {
  const errors: FileValidationError[] = [];

  // ファイル数チェック
  if (!validateFileCount(files)) {
    return [
      {
        fileName: '',
        error: `最大${MAX_FILES_PER_UPLOAD}ファイルまで選択できます（現在${files.length}個）`,
      },
    ];
  }

  // 個別ファイルチェック
  files.forEach((file) => {
    const error = validateSingleFile(file);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
}
