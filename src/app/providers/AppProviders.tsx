import React from 'react';

import '@/i18n/config';

import { repositoryComposition } from '@/adapters/repositories';

import { QueryProvider } from './QueryProvider';
import { RepositoryProvider } from './RepositoryProvider';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryProvider>
      <RepositoryProvider repositories={repositoryComposition}>
        <ThemeProvider>{children}</ThemeProvider>
      </RepositoryProvider>
    </QueryProvider>
  );
};
