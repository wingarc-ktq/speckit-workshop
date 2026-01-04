import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers';
import { router } from '@/app/router';
import { tKeys, loadZodLocale } from '@/i18n';

function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t(tKeys.title);
  }, [t, i18n.language]);

  useEffect(() => {
    loadZodLocale(i18n.language);
  }, [i18n.language]);

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
