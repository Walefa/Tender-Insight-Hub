import './App.css'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { AuthProvider } from './context/AuthContext';
import { PlanProvider } from './context/PlanContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordReset from './pages/PasswordReset';
import Dashboard from './pages/Dashboard';
import TenderSearch from './pages/TenderSearch';
import TenderDetails from './pages/TenderDetails';
import CompanyProfile from './pages/CompanyProfile';
import TeamManagement from './pages/TeamManagement';
import PlanManagement from './pages/PlanManagement';
import ApiDocs from './pages/ApiDocs';
import AcceptInvitation from './pages/AcceptInvitation';
import getTheme from './theme';
import { useMemo, useState, useEffect } from 'react';
import { initAnalytics, trackPageView } from './utils/analytics';

const App = () => {
  const [mode, setMode] = useState('light');
  useEffect(() => {
    const saved = localStorage.getItem('themeMode');
    if (saved === 'dark' || saved === 'light') setMode(saved);
  }, []);
  useEffect(() => {
    // sync body class with current mode
    if (typeof document !== 'undefined') {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(mode);
    }
  }, [mode]);
  const theme = useMemo(() => getTheme(mode), [mode]);
  const toggleMode = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      // update body class for global background gradients
      if (typeof document !== 'undefined') {
        document.body.classList.remove(prev);
        document.body.classList.add(next);
      }
      return next;
    });
  };

  // Initialize analytics once (if configured via env var VITE_GA_MEASUREMENT_ID)
  useEffect(() => {
    const id = import.meta?.env?.VITE_GA_MEASUREMENT_ID;
    if (id) initAnalytics(id);
  }, []);

  const AnalyticsTracker = () => {
    const location = useLocation();
    useEffect(() => {
      // manual SPA pageview on route changes
      trackPageView(location.pathname + location.search);
    }, [location]);
    return null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PlanProvider>
          <Router>
            <AppBar position="sticky" elevation={0} sx={{ 
              backdropFilter: 'blur(10px)',
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
              backgroundColor: theme => mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 32, 44, 0.85)'
            }}>
              <Toolbar sx={{ display: 'flex', gap: 2, minHeight: 68 }}>
                <Typography variant="h6" sx={{ 
                  flexGrow: 1, 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.3rem'
                }}>
                  Tender Insight Hub
                </Typography>
                <Button color="inherit" href="/dashboard" sx={{ 
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  '&:hover': { color: 'primary.main', transform: 'translateY(-1px)' }
                }}>
                  Dashboard
                </Button>
                <Button color="inherit" href="/search" sx={{ 
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  '&:hover': { color: 'primary.main', transform: 'translateY(-1px)' }
                }}>
                  Search
                </Button>
                <Button color="inherit" href="/profile" sx={{ 
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  '&:hover': { color: 'primary.main', transform: 'translateY(-1px)' }
                }}>
                  Profile
                </Button>
                <Button color="inherit" href="/team" sx={{ 
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  '&:hover': { color: 'primary.main', transform: 'translateY(-1px)' }
                }}>
                  Team
                </Button>
                <Button color="inherit" href="/plan" sx={{ 
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  '&:hover': { color: 'primary.main', transform: 'translateY(-1px)' }
                }}>
                  Plan
                </Button>
                <IconButton onClick={toggleMode} color="inherit" sx={{ 
                  ml: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'rotate(20deg) scale(1.05)' }
                }}>
                  {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
              </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ py: 4 }}>
              <AnalyticsTracker />
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset" element={<PasswordReset />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><TenderSearch /></ProtectedRoute>} />
                <Route path="/tender/:id" element={<ProtectedRoute><TenderDetails /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
                <Route path="/plan" element={<ProtectedRoute><PlanManagement /></ProtectedRoute>} />
                <Route path="/api-docs" element={<ApiDocs />} />
                <Route path="/invite/accept" element={<AcceptInvitation />} />
              </Routes>
            </Container>
          </Router>
        </PlanProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
