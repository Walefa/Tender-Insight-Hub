import { createTheme } from '@mui/material/styles';

const getTheme = (mode = 'light') => createTheme({
  palette: {
    mode,
    primary: { main: '#2e7d32', contrastText: '#ffffff' },
    secondary: { main: '#1565c0', contrastText: '#ffffff' },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    error: { main: '#d32f2f' },
    background:
      mode === 'light'
        ? { default: '#f4f6f8', paper: '#ffffff' }
        : { default: '#0b1220', paper: '#0f1629' },
    divider: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 4px rgba(0,0,0,0.06)',
    '0 4px 8px rgba(0,0,0,0.06)',
    '0 6px 12px rgba(0,0,0,0.08)',
    ...Array(20).fill('0 6px 12px rgba(0,0,0,0.08)')
  ],
  typography: {
    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1.1rem' },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'saturate(180%) blur(8px)'
        }
      }
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64
        }
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '24px',
          paddingBottom: '24px'
        }
      }
    },
    MuiButton: {
      defaultProps: { variant: 'contained' },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingLeft: 16,
          paddingRight: 16,
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' ? '0 8px 24px rgba(0,0,0,0.06)' : '0 8px 24px rgba(0,0,0,0.4)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          transition: 'transform .15s ease, box-shadow .15s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: mode === 'light' ? '0 10px 28px rgba(0,0,0,0.08)' : '0 10px 28px rgba(0,0,0,0.5)'
          }
        }
      }
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiTextField: {
      defaultProps: { size: 'small' }
    }
  }
});

export default getTheme;
