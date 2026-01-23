import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { enableMocking } from '@/adapters/mocks/browser.ts';
import App from '@/App.tsx';

// MSWを有効にしてからアプリを起動
enableMocking()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  })
  .catch(() => {
    // MSWが失敗してもアプリは起動する
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
