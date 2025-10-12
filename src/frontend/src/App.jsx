import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const App = () => {
  return (
    <AuthProvider>
      <PlanProvider>
        <Router>
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
          </Routes>
        </Router>
      </PlanProvider>
    </AuthProvider>
  );
};

export default App;
