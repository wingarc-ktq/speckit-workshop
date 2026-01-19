/**
 * テキスト内の検索キーワードに一致する部分を<mark>タグでハイライトする
 *
 * @param text - ハイライト対象のテキスト
 * @param searchKeyword - 検索キーワード（スペース区切りで複数指定可能）
 * @returns ハイライトされたHTMLテキスト
 *
 * @example
 * highlightMatch('請求書_20250110.pdf', '請求書')
 * // => '<mark>請求書</mark>_20250110.pdf'
 *
 * @example
 * highlightMatch('invoice_document.pdf', 'invoice doc')
 * // => '<mark>invoice</mark>_<mark>doc</mark>ument.pdf'
 */
export function highlightMatch(text: string, searchKeyword: string): string {
  // 検索キーワードが空、null、undefined、またはスペースのみの場合は元のテキストを返す
  if (!searchKeyword || !searchKeyword.trim()) {
    return text;
  }

  // テキストが空の場合はそのまま返す
  if (!text) {
    return text;
  }

  // スペース区切りで複数のキーワードを分割
  const keywords = searchKeyword
    .trim()
    .split(/\s+/)
    .filter((keyword) => keyword.length > 0);

  // キーワードがない場合は元のテキストを返す
  if (keywords.length === 0) {
    return text;
  }

  let result = text;

  // 各キーワードについてハイライト処理を実行
  keywords.forEach((keyword) => {
    // 正規表現の特殊文字をエスケープ
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 大文字小文字を区別せずにグローバルマッチ
    const regex = new RegExp(escapedKeyword, 'gi');

    // 一致する部分を<mark>タグで囲む
    result = result.replace(regex, (match) => `<mark>${match}</mark>`);
  });

  return result;
}
