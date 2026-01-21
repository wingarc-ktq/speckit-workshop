import type {
  Tag,
  CreateTagRequest,
  UpdateTagRequest,
} from '@/domain/models/tag';

import type { AxiosInstance } from 'axios';

/**
 * TagRepository インターフェース
 * Tag エンティティの CRUD 操作を定義
 */
export interface ITagRepository {
  /**
   * 全タグを取得
   * @returns タグ一覧
   * @throws DocumentException
   */
  getTags(): Promise<Tag[]>;

  /**
   * 新しいタグを作成
   * @param data - 作成リクエスト（名前、色）
   * @returns 作成されたタグ
   * @throws DocumentException
   */
  createTag(data: CreateTagRequest): Promise<Tag>;

  /**
   * タグを更新
   * @param id - タグ ID
   * @param data - 更新リクエスト
   * @returns 更新されたタグ
   * @throws DocumentException
   */
  updateTag(id: string, data: UpdateTagRequest): Promise<Tag>;

  /**
   * タグを削除
   * @param id - タグ ID
   * @returns 削除されたタグ
   * @throws DocumentException
   */
  deleteTag(id: string): Promise<Tag>;

  /**
   * タグ ID で単一タグを取得
   * @param id - タグ ID
   * @returns タグ
   * @throws DocumentException
   */
  getTagById(id: string): Promise<Tag>;
}

/**
 * TagRepository 実装
 */
export class TagRepository implements ITagRepository {
  /**
   * コンストラクタ
   * @param axiosInstance - Axios インスタンス
   */
  axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async getTags(): Promise<Tag[]> {
    const response = await this.axiosInstance.get<Tag[]>('/tags');
    return response.data;
  }

  async createTag(data: CreateTagRequest): Promise<Tag> {
    const response = await this.axiosInstance.post<Tag>('/tags', data);
    return response.data;
  }

  async updateTag(id: string, data: UpdateTagRequest): Promise<Tag> {
    const response = await this.axiosInstance.put<Tag>(`/tags/${id}`, data);
    return response.data;
  }

  async deleteTag(id: string): Promise<Tag> {
    const response = await this.axiosInstance.delete<Tag>(`/tags/${id}`);
    return response.data;
  }

  async getTagById(id: string): Promise<Tag> {
    const response = await this.axiosInstance.get<Tag>(`/tags/${id}`);
    return response.data;
  }
}
