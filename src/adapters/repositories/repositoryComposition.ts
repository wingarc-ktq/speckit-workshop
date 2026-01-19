/**
 * アプリケーションのリポジトリの構成
 *
 * src/adapters/repositories 以下のリポジトリを束ねて定義します。
 * 新規にrepositories配下にディレクトリを作成した場合は、ここに追加してください。
 */
import * as auth from './auth';
import axios, { type AxiosError } from 'axios';
import { WebApiException, NetworkException } from '@/domain/errors';
import { DocumentRepository } from './DocumentRepository';
import { TagRepository } from './TagRepository';

// Axiosクライアントを直接作成
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true,
  paramsSerializer: { indexes: null },
});

// エラーインターセプターを設定
axiosInstance.interceptors.response.use(null, (error: AxiosError) => {
  if (error.response) {
    throw new WebApiException(
      error.response.status,
      error.response.statusText,
      error.response.data
    );
  } else {
    throw new NetworkException(error.message);
  }
});

/**
 * リポジトリの構成型
 */
export type RepositoryComposition = {
  auth: typeof auth;
  document: DocumentRepository;
  tag: TagRepository;
};

/**
 * アプリケーションのリポジトリの構成
 */
export const repositoryComposition: RepositoryComposition = {
  auth,
  document: new DocumentRepository(axiosInstance),
  tag: new TagRepository(axiosInstance),
} as const;
