/**
 * アプリケーションのリポジトリの構成
 *
 * src/adapters/repositories 以下のリポジトリを束ねて定義します。
 * 新規にrepositories配下にディレクトリを作成した場合は、ここに追加してください。
 */
import * as auth from './auth';
import { customInstance } from '../axios';
import { DocumentRepository } from './DocumentRepository';
import { TagRepository } from './TagRepository';

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
  document: new DocumentRepository(customInstance),
  tag: new TagRepository(customInstance),
} as const;
