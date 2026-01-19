import { describe, expect, it } from 'vitest';

import {
  formatFileSize,
  getFileExtension,
  MAX_FILE_SIZE,
  MAX_FILES_COUNT,
  SUPPORTED_FILE_TYPES,
  validateFileCount,
  validateFileSize,
  validateFileType,
  type FileInfo,
} from '../FileInfo';

describe('FileInfo', () => {
  describe('FileInfo型', () => {
    it('should define FileInfo interface correctly', () => {
      const fileInfo: FileInfo = {
        id: 'file-001',
        name: 'sample.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
        description: 'サンプルファイル',
        uploadedAt: '2026-01-19T10:00:00Z',
        downloadUrl: 'https://example.com/files/file-001',
        tagIds: ['tag-001', 'tag-002'],
      };

      expect(fileInfo.id).toBe('file-001');
      expect(fileInfo.name).toBe('sample.pdf');
      expect(fileInfo.size).toBe(1024000);
      expect(fileInfo.tagIds).toHaveLength(2);
    });
  });

  describe('定数', () => {
    it('should have correct SUPPORTED_FILE_TYPES', () => {
      expect(SUPPORTED_FILE_TYPES).toEqual(['application/pdf', 'image/jpeg', 'image/png']);
    });

    it('should have correct MAX_FILE_SIZE (10MB)', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });

    it('should have correct MAX_FILES_COUNT', () => {
      expect(MAX_FILES_COUNT).toBe(20);
    });
  });

  describe('validateFileType', () => {
    it('should return true for PDF file', () => {
      const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
      expect(validateFileType(file)).toBe(true);
    });

    it('should return true for JPEG file', () => {
      const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
      expect(validateFileType(file)).toBe(true);
    });

    it('should return true for PNG file', () => {
      const file = new File(['dummy'], 'test.png', { type: 'image/png' });
      expect(validateFileType(file)).toBe(true);
    });

    it('should return false for unsupported file type', () => {
      const file = new File(['dummy'], 'test.txt', { type: 'text/plain' });
      expect(validateFileType(file)).toBe(false);
    });

    it('should return false for Word document', () => {
      const file = new File(['dummy'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      expect(validateFileType(file)).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should return true for file within size limit', () => {
      const file = new File(['x'.repeat(1024)], 'test.pdf', { type: 'application/pdf' });
      expect(validateFileSize(file)).toBe(true);
    });

    it('should return true for file exactly at size limit', () => {
      const file = new File(['x'.repeat(MAX_FILE_SIZE)], 'test.pdf', { type: 'application/pdf' });
      expect(validateFileSize(file)).toBe(true);
    });

    it('should return false for file exceeding size limit', () => {
      const file = new File(['x'.repeat(MAX_FILE_SIZE + 1)], 'test.pdf', {
        type: 'application/pdf',
      });
      expect(validateFileSize(file)).toBe(false);
    });

    it('should accept custom max size', () => {
      const customMax = 1024;
      const file = new File(['x'.repeat(2048)], 'test.pdf', { type: 'application/pdf' });
      expect(validateFileSize(file, customMax)).toBe(false);
    });
  });

  describe('validateFileCount', () => {
    it('should return true for files within count limit', () => {
      const files = Array(10)
        .fill(null)
        .map(() => new File(['dummy'], 'test.pdf', { type: 'application/pdf' }));
      expect(validateFileCount(files)).toBe(true);
    });

    it('should return true for files exactly at count limit', () => {
      const files = Array(MAX_FILES_COUNT)
        .fill(null)
        .map(() => new File(['dummy'], 'test.pdf', { type: 'application/pdf' }));
      expect(validateFileCount(files)).toBe(true);
    });

    it('should return false for files exceeding count limit', () => {
      const files = Array(MAX_FILES_COUNT + 1)
        .fill(null)
        .map(() => new File(['dummy'], 'test.pdf', { type: 'application/pdf' }));
      expect(validateFileCount(files)).toBe(false);
    });

    it('should accept custom max count', () => {
      const customMax = 5;
      const files = Array(10)
        .fill(null)
        .map(() => new File(['dummy'], 'test.pdf', { type: 'application/pdf' }));
      expect(validateFileCount(files, customMax)).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1.75)).toBe('1.75 KB');
    });
  });

  describe('getFileExtension', () => {
    it('should return .pdf for application/pdf', () => {
      expect(getFileExtension('application/pdf')).toBe('.pdf');
    });

    it('should return .jpg for image/jpeg', () => {
      expect(getFileExtension('image/jpeg')).toBe('.jpg');
    });

    it('should return .png for image/png', () => {
      expect(getFileExtension('image/png')).toBe('.png');
    });

    it('should return empty string for unknown MIME type', () => {
      expect(getFileExtension('text/plain')).toBe('');
    });
  });
});
