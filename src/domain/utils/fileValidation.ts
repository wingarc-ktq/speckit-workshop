/**
 * ファイルバリデーションユーティリティ
 */

/**
 * ファイルタイプを検証
 * @param file - 検証するファイル
 * @param allowedTypes - 許可されるMIMEタイプの配列
 * @returns ファイルタイプが許可されている場合true
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * ファイルサイズを検証
 * @param file - 検証するファイル
 * @param maxSize - 最大サイズ（バイト）
 * @returns ファイルサイズが制限内の場合true
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * ファイル数を検証
 * @param files - 検証するファイル配列
 * @param maxCount - 最大ファイル数
 * @returns ファイル数が制限内の場合true
 */
export function validateFileCount(files: File[], maxCount: number): boolean {
  return files.length <= maxCount;
}

/**
 * 複数のファイルを一括検証
 * @param files - 検証するファイル配列
 * @param options - 検証オプション
 * @returns 検証結果
 */
export interface FileValidationOptions {
  allowedTypes?: string[];
  maxSize?: number;
  maxCount?: number;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateFiles(
  files: File[],
  options: FileValidationOptions = {},
): FileValidationResult {
  const errors: string[] = [];

  // ファイル数チェック
  if (options.maxCount !== undefined && !validateFileCount(files, options.maxCount)) {
    errors.push(`ファイルは${options.maxCount}個まで選択できます`);
  }

  // 各ファイルを検証
  files.forEach((file, index) => {
    // ファイルタイプチェック
    if (options.allowedTypes && !validateFileType(file, options.allowedTypes)) {
      errors.push(`${file.name}: サポートされていないファイル形式です`);
    }

    // ファイルサイズチェック
    if (options.maxSize !== undefined && !validateFileSize(file, options.maxSize)) {
      const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(0);
      errors.push(`${file.name}: ファイルサイズは${maxSizeMB}MBまでです`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
