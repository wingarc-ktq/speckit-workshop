import axios from 'axios';

import { NetworkException, WebApiException } from '@/domain/errors';

import type { AxiosError, AxiosRequestConfig } from 'axios';

const axiosClient = axios.create({
  // Base URL設定 - 環境変数から取得、デフォルトは開発用
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true,
  paramsSerializer: { indexes: null },
});

axiosClient.interceptors.response.use(null, (error: AxiosError) => {
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

export async function customInstance<T>(
  config: AxiosRequestConfig
): Promise<T> {
  const { data } = await axiosClient(config);
  return data;
}
