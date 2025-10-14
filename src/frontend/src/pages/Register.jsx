import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext.jsx';

const Register = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = {
        user_data: {
          full_name: fullName,
          email: email,
          password: password,
        },
        team_name: teamName,
      };
      await api.post('/auth/register', data);
      window.alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
    }
  };
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>Register</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Team Name" fullWidth margin="normal" required value={teamName} onChange={e => setTeamName(e.target.value)} />
        <TextField label="Full Name" fullWidth margin="normal" required value={fullName} onChange={e => setFullName(e.target.value)} />
        <TextField label="Email" fullWidth margin="normal" required value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" required value={password} onChange={e => setPassword(e.target.value)} />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Register</Button>
      </form>
    </Box>
  );
};

export default Register;
