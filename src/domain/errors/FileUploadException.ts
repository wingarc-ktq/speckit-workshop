import { ApplicationException } from './ApplicationException';

/**
 * ファイルアップロード関連エラー
 */
export class FileUploadException extends ApplicationException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * ファイルサイズ超過エラー
 */
export class FileSizeExceededException extends FileUploadException {
  readonly maxSize: number;
  readonly actualSize: number;

  constructor(maxSize: number, actualSize: number) {
    super(
      `File size exceeds maximum limit (${maxSize} bytes). Actual size: ${actualSize} bytes`
    );
    this.maxSize = maxSize;
    this.actualSize = actualSize;
  }
}

/**
 * 非対応ファイル形式エラー
 */
export class UnsupportedFileFormatException extends FileUploadException {
  readonly fileFormat: string;
  readonly supportedFormats: string[];

  constructor(fileFormat: string, supportedFormats: string[]) {
    super(
      `File format "${fileFormat}" is not supported. Supported formats: ${supportedFormats.join(', ')}`
    );
    this.fileFormat = fileFormat;
    this.supportedFormats = supportedFormats;
  }
}

/**
 * ファイル数超過エラー
 */
export class FileLimitExceededException extends FileUploadException {
  readonly maxFiles: number;
  readonly actualFiles: number;

  constructor(maxFiles: number, actualFiles: number) {
    super(
      `Number of files exceeds maximum limit (${maxFiles}). Actual count: ${actualFiles}`
    );
    this.maxFiles = maxFiles;
    this.actualFiles = actualFiles;
  }
}

/**
 * ファイル読み込みエラー
 */
export class FileReadException extends FileUploadException {
  constructor(fileName: string, reason?: string) {
    super(`Failed to read file "${fileName}"${reason ? `: ${reason}` : ''}`);
  }
}

/**
 * ファイル検証エラー
 */
export class FileValidationException extends FileUploadException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * アップロード中断エラー
 */
export class FileUploadCancelledException extends FileUploadException {
  constructor(fileName: string) {
    super(`Upload for file "${fileName}" was cancelled`);
  }
}

/**
 * 重複ファイルエラー
 */
export class DuplicateFileException extends FileUploadException {
  readonly fileName: string;

  constructor(fileName: string) {
    super(`File with name "${fileName}" already exists`);
    this.fileName = fileName;
  }
}
