import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext.jsx';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // Map email to username
      formData.append('password', password);

      const res = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      // Save token if needed
      const token = res.data.access_token;
      if (token) {
        const authHeader = `Bearer ${token}`;
        api.defaults.headers.common['Authorization'] = authHeader;

        // Temporary store to ensure interceptors pick up the fresh token
        localStorage.setItem('user', JSON.stringify({ token }));

        const userRes = await api.get('/auth/me', {
          headers: {
            Authorization: authHeader,
          },
        });

  login({ ...userRes.data, token });
  const params = new URLSearchParams(location.search);
  const next = params.get('next');
  navigate(next || '/dashboard');
      } else {
        setError('Login failed: No token received');
      }
    } catch (err) {
      console.error('Login error', err);
      setError(err.response?.data?.detail || err.message || 'Login failed');
    }
  };
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Email" fullWidth margin="normal" required value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" required value={password} onChange={e => setPassword(e.target.value)} />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
      </form>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          Don't have an account? <Button variant="text" onClick={() => navigate('/register')}>Register</Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
