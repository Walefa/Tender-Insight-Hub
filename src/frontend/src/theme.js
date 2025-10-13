import { createTheme } from '@mui/material/styles';

const getTheme = (mode = 'light') => createTheme({
  palette: {
    mode,
    primary: { main: '#2e7d32' },
    secondary: { main: '#1976d2' },
    background:
      mode === 'light'
        ? { default: '#f5f7fb', paper: '#ffffff' }
        : { default: '#0f172a', paper: '#111827' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
  },
  components: {
    MuiButton: {
      defaultProps: { variant: 'contained' },
      styleOverrides: { root: { textTransform: 'none', borderRadius: 10 } },
    },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 10 } } },
  },
});

export default getTheme;
