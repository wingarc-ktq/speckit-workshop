import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import { LoadingOverlay } from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  const theme = createTheme();

  const renderLoadingOverlay = (props: { open: boolean }) => {
    return render(
      <ThemeProvider theme={theme}>
        <LoadingOverlay {...props} />
      </ThemeProvider>
    );
  };

  describe('表示状態', () => {
    test('open=trueの時にローディングオーバーレイが表示されること', () => {
      renderLoadingOverlay({ open: true });

      const backdrop = screen.getByTestId('loading-overlay');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).not.toHaveStyle({ visibility: 'hidden' });
    });

    test('open=falseの時にローディングオーバーレイが非表示になること', () => {
      renderLoadingOverlay({ open: false });

      const backdrop = screen.getByTestId('loading-overlay');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveStyle({ visibility: 'hidden' });
    });
  });

  describe('z-index設定', () => {
    test('ダイアログよりも上に表示されるようにz-indexがmodal + 1に設定されていること', () => {
      renderLoadingOverlay({ open: true });

      const backdrop = screen.getByTestId('loading-overlay');
      // modal (1300) + 1 = 1301 が設定されていることを確認
      expect(backdrop).toHaveStyle({
        'z-index': (theme.zIndex.modal + 1).toString(),
      });
    });
  });
});
