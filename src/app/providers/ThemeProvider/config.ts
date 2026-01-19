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
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#757575',
          '&.Mui-checked': {
            color: '#FF9800',
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 152, 0, 0.08)',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: '#424242',
          fontWeight: 500,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#424242',
          fontWeight: 500,
          '&.Mui-focused': {
            color: '#FF9800',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D0D0D0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FF9800',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FF9800',
          },
        },
        input: {
          color: '#424242',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#424242',
        },
        head: {
          color: '#424242',
          fontWeight: 600,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#757575',
          '&:hover': {
            color: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.08)',
          },
        },
      },
    },
  },
});
