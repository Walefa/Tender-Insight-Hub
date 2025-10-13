import React, { useState, useContext } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext.jsx';

const Register = () => {
  const { login } = useContext(AuthContext);
  const [teamName, setTeamName] = useState('');
  const [companyName, setCompanyName] = useState('');
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

      const res = await api.post('/auth/register', data); // Updated endpoint
      login(res.data.user); // Save user in context
      // TODO: Redirect to dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>Register</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Team Name" fullWidth margin="normal" required value={teamName} onChange={e => setTeamName(e.target.value)} />
        <TextField label="Company Name" fullWidth margin="normal" required value={companyName} onChange={e => setCompanyName(e.target.value)} />
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
