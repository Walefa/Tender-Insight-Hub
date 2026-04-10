import { createTheme } from '@mui/material/styles';

const getTheme = (mode = 'light') => createTheme({
  palette: {
    mode,
    primary: { 
      main: '#10b981',
      light: '#6ee7b7',
      dark: '#059669',
      contrastText: '#ffffff' 
    },
    secondary: { 
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff' 
    },
    success: { main: '#10b981', light: '#6ee7b7', dark: '#059669' },
    warning: { main: '#f59e0b', light: '#fcd34d', dark: '#d97706' },
    error: { main: '#ef4444', light: '#fca5a5', dark: '#dc2626' },
    info: { main: '#3b82f6', light: '#60a5fa', dark: '#1d4ed8' },
    background:
      mode === 'light'
        ? { default: '#f8fafc', paper: '#ffffff' }
        : { default: '#0f1419', paper: '#1a202c' },
    divider: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
    text: {
      primary: mode === 'light' ? '#1e293b' : '#f1f5f9',
      secondary: mode === 'light' ? '#64748b' : '#cbd5e1',
      disabled: mode === 'light' ? '#a8acb1' : '#64748b'
    }
  },
  shape: { borderRadius: 14 },
  spacing: 8,
  shadows: mode === 'light' ? [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 1px 0 rgba(0, 0, 0, 0.02)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
    ...Array(18).fill('0 25px 50px -12px rgba(0, 0, 0, 0.12)')
  ] : [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 1px 0 rgba(0, 0, 0, 0.2)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.38), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.45), 0 4px 6px -2px rgba(0, 0, 0, 0.35)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    ...Array(18).fill('0 25px 50px -12px rgba(0, 0, 0, 0.6)')
  ],
  typography: {
    fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.025em', lineHeight: 1.2 },
    h2: { fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', lineHeight: 1.3 },
    h3: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.015em', lineHeight: 1.3 },
    h4: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em', lineHeight: 1.4 },
    h5: { fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.005em', lineHeight: 1.4 },
    h6: { fontWeight: 700, fontSize: '1.1rem', letterSpacing: 0, lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.625 },
    body2: { fontSize: '0.875rem', lineHeight: 1.625 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.005em' },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0.01em' }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 32, 44, 0.85)',
          borderBottom: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)'}`
        }
      }
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 68,
          paddingLeft: '24px',
          paddingRight: '24px'
        }
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '32px',
          paddingBottom: '32px'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 700,
          padding: '10px 18px',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease'
        },
        contained: {
          boxShadow: mode === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: mode === 'light' ? '0 10px 15px -3px rgba(0, 0, 0, 0.15)' : '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
            transform: 'translateY(-2px)'
          }
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: mode === 'light' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.1)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundImage: mode === 'light' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
          backdropFilter: 'blur(10px)',
          border: mode === 'light' ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: mode === 'light' 
            ? '0 8px 16px rgba(0, 0, 0, 0.05)' 
            : '0 8px 16px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease'
        },
        elevation0: { border: 'none', boxShadow: 'none' },
        elevation1: { boxShadow: mode === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.04)' : '0 2px 8px rgba(0, 0, 0, 0.3)' }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundImage: mode === 'light' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
          backdropFilter: 'blur(8px)',
          border: mode === 'light' ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'light' 
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
              : '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
            borderColor: mode === 'light' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'
          }
        }
      }
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.3)',
            '& fieldset': {
              borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)'
            },
            '&:hover fieldset': {
              borderColor: mode === 'light' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.4)'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#10b981',
              borderWidth: 2
            }
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)'}`
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)'}`
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    MuiStack: {
      defaultProps: { spacing: 2 }
    }
  }
});

export default getTheme;
