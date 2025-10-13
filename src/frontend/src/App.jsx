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
  const theme = useMemo(() => getTheme(mode), [mode]);
  const toggleMode = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
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
            <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
              <Toolbar sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Tender Insight Hub</Typography>
                <Button color="primary" href="/dashboard">Dashboard</Button>
                <Button color="primary" href="/search">Search</Button>
                <Button color="primary" href="/profile">Company Profile</Button>
                <Button color="primary" href="/team">Team</Button>
                <Button color="primary" href="/plan">Plan</Button>
                <IconButton onClick={toggleMode} color="inherit" sx={{ ml: 1 }}>
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
