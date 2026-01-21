import type {
  Document,
  DocumentFilter,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentListResponse,
} from '@/domain/models/document';

import type { AxiosInstance } from 'axios';

/**
 * DocumentRepository インターフェース
 * Document エンティティの CRUD 操作を定義
 */
export interface IDocumentRepository {
  /**
   * 文書一覧を取得
   * @param filters - フィルター条件（検索、タグ、ページネーション）
   * @returns 文書リストと ページネーション情報
   * @throws DocumentException
   */
  getDocuments(
    filters: DocumentFilter & { page?: number; limit?: number }
  ): Promise<DocumentListResponse>;

  /**
   * ファイルをアップロード
   * @param data - 作成リクエスト（ファイル、タグID）
   * @returns アップロードされた文書
   * @throws FileUploadException
   */
  uploadDocument(data: CreateDocumentRequest): Promise<Document>;

  /**
   * 特定の文書を ID で取得
   * @param id - 文書 ID
   * @returns 文書
   * @throws DocumentNotFoundException
   */
  getDocumentById(id: string): Promise<Document>;

  /**
   * 文書のメタデータを更新（ファイル名、タグ等）
   * @param id - 文書 ID
   * @param data - 更新リクエスト
   * @returns 更新された文書
   * @throws DocumentNotFoundException
   */
  updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document>;

  /**
   * 文書を論理削除（ゴミ箱に移動）
   * @param id - 文書 ID
   * @returns 削除された文書
   * @throws DocumentNotFoundException
   */
  deleteDocument(id: string): Promise<Document>;

  /**
   * ゴミ箱から文書を復元
   * @param id - 文書 ID
   * @returns 復元された文書
   * @throws DocumentNotFoundException
   */
  restoreDocument(id: string): Promise<Document>;

  /**
   * ゴミ箱内の文書一覧を取得
   * @param page - ページ番号
   * @param limit - 1 ページあたりの件数
   * @returns 削除済み文書リスト
   */
  getTrashDocuments(page?: number, limit?: number): Promise<DocumentListResponse>;

  /**
   * ダウンロード用の URL を取得
   * @param id - 文書 ID
   * @returns ダウンロード URL
   * @throws DocumentNotFoundException
   */
  getDownloadUrl(id: string): string;
}

/**
 * DocumentRepository 実装
 */
export class DocumentRepository implements IDocumentRepository {
  /**
   * コンストラクタ
   * @param axiosInstance - Axios インスタンス
   */
  axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async getDocuments(
    filters: DocumentFilter & { page?: number; limit?: number }
  ): Promise<DocumentListResponse> {
    const { search, tagIds, page = 1, limit = 20 } = filters;
    const params: Record<string, string | number | string[]> = {
      page,
      limit,
    };

    if (search) {
      params.search = search;
    }

    if (tagIds && tagIds.length > 0) {
      params.tagIds = tagIds;
    }

    const response = await this.axiosInstance.get<DocumentListResponse>('/files', {
      params,
    });
    return response.data;
  }

  async uploadDocument(data: CreateDocumentRequest): Promise<Document> {
    const formData = new FormData();
    formData.append('file', data.file);

    if (data.tagIds) {
      data.tagIds.forEach((tagId) => {
        formData.append('tagIds', tagId);
      });
    }

    const response = await this.axiosInstance.post<Document>('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getDocumentById(id: string): Promise<Document> {
    const response = await this.axiosInstance.get<Document>(`/files/${id}`);
    return response.data;
  }

  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const response = await this.axiosInstance.put<Document>(`/files/${id}`, data);
    return response.data;
  }

  async deleteDocument(id: string): Promise<Document> {
    const response = await this.axiosInstance.delete<Document>(`/files/${id}`);
    return response.data;
  }

  async restoreDocument(id: string): Promise<Document> {
    const response = await this.axiosInstance.post<Document>(
      `/files/${id}/restore`,
      {}
    );
    return response.data;
  }

  async getTrashDocuments(page = 1, limit = 20): Promise<DocumentListResponse> {
    const response = await this.axiosInstance.get<DocumentListResponse>('/files', {
      params: {
        isDeleted: true,
        page,
        limit,
      },
    });
    return response.data;
  }

  /**
   * ダウンロード用の URL を取得
   * @param id - 文書 ID
   * @returns ダウンロード URL
   * @throws DocumentNotFoundException
   */
  getDownloadUrl(id: string): string {
    return `${this.axiosInstance.defaults.baseURL}/files/${id}/download`;
  }
}
