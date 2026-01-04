import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { LoadingController } from './components';
import { queryClient } from './config';

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingController>{children}</LoadingController>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
