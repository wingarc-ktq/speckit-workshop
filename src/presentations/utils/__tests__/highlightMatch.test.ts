import { describe, it, expect } from 'vitest';
import { highlightMatch } from '../highlightMatch';

describe('highlightMatch', () => {
  describe('基本的な一致検出', () => {
    it('一致する文字列をハイライトする', () => {
      const result = highlightMatch('請求書_20250110.pdf', '請求書');
      expect(result).toBe('<mark>請求書</mark>_20250110.pdf');
    });

    it('一致しない場合は元のテキストをそのまま返す', () => {
      const result = highlightMatch('契約書_20250108.docx', '請求書');
      expect(result).toBe('契約書_20250108.docx');
    });

    it('空の検索キーワードの場合は元のテキストを返す', () => {
      const result = highlightMatch('請求書_20250110.pdf', '');
      expect(result).toBe('請求書_20250110.pdf');
    });

    it('複数箇所の一致を全てハイライトする', () => {
      const result = highlightMatch('test_file_test.pdf', 'test');
      expect(result).toBe('<mark>test</mark>_file_<mark>test</mark>.pdf');
    });
  });

  describe('大文字小文字を区別しない一致', () => {
    it('大文字小文字を区別せずに一致させる（英語）', () => {
      const result = highlightMatch('Document_File.pdf', 'document');
      expect(result).toBe('<mark>Document</mark>_File.pdf');
    });

    it('大文字小文字を区別せずに一致させる（混在）', () => {
      const result = highlightMatch('Test_FILE.pdf', 'test');
      expect(result).toBe('<mark>Test</mark>_FILE.pdf');
    });

    it('大文字小文字を区別せずに一致させる（逆パターン）', () => {
      const result = highlightMatch('document_file.pdf', 'DOCUMENT');
      expect(result).toBe('<mark>document</mark>_file.pdf');
    });
  });

  describe('部分一致', () => {
    it('単語の一部にマッチする', () => {
      const result = highlightMatch('請求書類_20250110.pdf', '請求');
      expect(result).toBe('<mark>請求</mark>書類_20250110.pdf');
    });

    it('ファイル名の途中にマッチする', () => {
      const result = highlightMatch('contract_2025_final.pdf', '2025');
      expect(result).toBe('contract_<mark>2025</mark>_final.pdf');
    });
  });

  describe('特殊文字とエスケープ', () => {
    it('正規表現の特殊文字を含む検索語を正しく処理する', () => {
      const result = highlightMatch('test (2).pdf', '(2)');
      expect(result).toBe('test <mark>(2)</mark>.pdf');
    });

    it('ドットを含む検索語を正しく処理する', () => {
      const result = highlightMatch('file.test.pdf', '.test');
      expect(result).toBe('file<mark>.test</mark>.pdf');
    });

    it('アスタリスクを含む検索語を正しく処理する', () => {
      const result = highlightMatch('note*final.pdf', 'note*');
      expect(result).toBe('<mark>note*</mark>final.pdf');
    });

    it('バックスラッシュを含む検索語を正しく処理する', () => {
      const result = highlightMatch('path\\file.pdf', 'path\\');
      expect(result).toBe('<mark>path\\</mark>file.pdf');
    });
  });

  describe('複数キーワード', () => {
    it('スペース区切りの複数キーワードを全てハイライトする', () => {
      const result = highlightMatch('請求書_田中_商事.pdf', '請求書 田中');
      expect(result).toBe('<mark>請求書</mark>_<mark>田中</mark>_商事.pdf');
    });

    it('複数キーワードのいずれかにマッチする', () => {
      const result = highlightMatch('contract_document.pdf', 'contract invoice');
      expect(result).toBe('<mark>contract</mark>_document.pdf');
    });

    it('全てのキーワードがマッチする場合', () => {
      const result = highlightMatch('invoice_202501_final.pdf', 'invoice 2025 final');
      expect(result).toBe('<mark>invoice</mark>_<mark>2025</mark>01_<mark>final</mark>.pdf');
    });
  });

  describe('エッジケース', () => {
    it('検索キーワードがnullの場合は元のテキストを返す', () => {
      const result = highlightMatch('test.pdf', null as unknown as string);
      expect(result).toBe('test.pdf');
    });

    it('検索キーワードがundefinedの場合は元のテキストを返す', () => {
      const result = highlightMatch('test.pdf', undefined as unknown as string);
      expect(result).toBe('test.pdf');
    });

    it('テキストが空文字列の場合', () => {
      const result = highlightMatch('', '検索');
      expect(result).toBe('');
    });

    it('両方が空文字列の場合', () => {
      const result = highlightMatch('', '');
      expect(result).toBe('');
    });

    it('検索キーワードにスペースのみの場合は元のテキストを返す', () => {
      const result = highlightMatch('test.pdf', '   ');
      expect(result).toBe('test.pdf');
    });
  });

  describe('日本語テキスト', () => {
    it('日本語テキストを正しくハイライトする', () => {
      const result = highlightMatch('見積書_田中商事_2025年1月.pdf', '田中商事');
      expect(result).toBe('見積書_<mark>田中商事</mark>_2025年1月.pdf');
    });

    it('ひらがなとカタカナを区別する', () => {
      const result = highlightMatch('てすと_テスト.pdf', 'てすと');
      expect(result).toBe('<mark>てすと</mark>_テスト.pdf');
    });

    it('漢字の部分一致を検出する', () => {
      const result = highlightMatch('重要書類_最終版.pdf', '重要');
      expect(result).toBe('<mark>重要</mark>書類_最終版.pdf');
    });
  });

  describe('パフォーマンスと長文', () => {
    it('長いファイル名を正しく処理する', () => {
      const longFileName = 'これは非常に長いファイル名で複数の検索キーワードが含まれている可能性があるテストファイルです_20250110.pdf';
      const result = highlightMatch(longFileName, '検索');
      expect(result).toBe('これは非常に長いファイル名で複数の<mark>検索</mark>キーワードが含まれている可能性があるテストファイルです_20250110.pdf');
    });
  });
});
