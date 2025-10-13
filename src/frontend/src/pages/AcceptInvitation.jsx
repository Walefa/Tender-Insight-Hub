import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import api from '../utils/api';

const AcceptInvitation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!token) {
      setError('Invitation token missing.');
      return;
    }
    if (!fullName || !password) {
      setError('Please provide your full name and a password.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/team/invitations/accept', {
        token,
        full_name: fullName,
        password,
      });
      setSuccess('Invitation accepted! You can now log in.');
      // Redirect to login after a short delay
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to accept invitation';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>Accept Invitation</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Token"
          fullWidth
          margin="normal"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          helperText="This should be in your invite link."
        />
        <TextField
          label="Full Name"
          fullWidth
          margin="normal"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
          {loading ? <CircularProgress size={22} /> : 'Accept Invitation'}
        </Button>
      </form>
    </Box>
  );
};

export default AcceptInvitation;
