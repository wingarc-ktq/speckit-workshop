/**
 * ファイルダウンロード機能
 * ブラウザのダウンロード機能を使用してファイルをダウンロードする
 */

/**
 * URLからファイルをダウンロードする
 * @param url - ダウンロードするファイルのURL
 * @param filename - ダウンロード時のファイル名
 */
export const downloadFile = (url: string, filename: string): void => {
  // aタグを動的に作成
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  // DOMに追加してクリックをトリガー
  document.body.appendChild(link);
  link.click();

  // クリーンアップ
  document.body.removeChild(link);
};

/**
 * Blob データからファイルをダウンロードする
 * @param blob - ダウンロードするBlobデータ
 * @param filename - ダウンロード時のファイル名
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  // メモリリークを防ぐためにURLを解放
  setTimeout(() => URL.revokeObjectURL(url), 100);
};
