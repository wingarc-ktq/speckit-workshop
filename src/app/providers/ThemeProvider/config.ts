import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  colorSchemes: {
    dark: true,
  },
  palette: {
    primary: {
      main: '#FF9800',
      dark: '#FB8C00',
      light: '#FFB74D',
    },
    background: {
      default: '#FFFBF5',
      paper: '#FFFFFF',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #FF9800 0%, #FB8C00 100%)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(to bottom, #EEF2FF 0%, #E0E7FF 100%)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: '1px solid #FFD6A7',
        },
      },
    },
  },
});
