import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext.jsx';
import { validateRegistrationForm, validatePassword } from '../utils/validation';

const Register = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Validate individual fields on blur
  const handleEmailBlur = () => {
    setFieldErrors(prev => ({
      ...prev,
      email: email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Invalid email format' : ''
    }));
  };
  
  const handlePasswordBlur = () => {
    if (password) {
      const { errors } = validatePassword(password);
      setFieldErrors(prev => ({
        ...prev,
        password: errors ? errors[0] : ''
      }));
    }
  };
  
  const handleFullNameBlur = () => {
    setFieldErrors(prev => ({
      ...prev,
      full_name: fullName && !/^[a-zA-Z\s'-]+$/.test(fullName) ? 'Only letters, spaces, hyphens, and apostrophes allowed' : ''
    }));
  };
  
  const handleTeamNameBlur = () => {
    setFieldErrors(prev => ({
      ...prev,
      team_name: teamName && !/^[a-zA-Z0-9\s\-_.]+$/.test(teamName) ? 'Invalid team name format' : ''
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Validate all fields
    const { valid, errors, sanitized } = validateRegistrationForm({
      email,
      full_name: fullName,
      password,
      team_name: teamName
    });
    
    if (!valid) {
      setFieldErrors(errors);
      setError('Please fix the errors below');
      return;
    }
    
    try {
      const data = {
        user_data: {
          full_name: sanitized.full_name,
          email: sanitized.email,
          password: sanitized.password,
        },
        team_name: sanitized.team_name,
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
        <TextField 
          label="Team Name" 
          fullWidth 
          margin="normal" 
          required 
          value={teamName} 
          onChange={e => setTeamName(e.target.value)}
          onBlur={handleTeamNameBlur}
          error={!!fieldErrors.team_name}
          helperText={fieldErrors.team_name}
        />
        <TextField 
          label="Full Name" 
          fullWidth 
          margin="normal" 
          required 
          value={fullName} 
          onChange={e => setFullName(e.target.value)}
          onBlur={handleFullNameBlur}
          error={!!fieldErrors.full_name}
          helperText={fieldErrors.full_name}
        />
        <TextField 
          label="Email" 
          fullWidth 
          margin="normal" 
          required 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
          error={!!fieldErrors.email}
          helperText={fieldErrors.email}
        />
        <TextField 
          label="Password" 
          type="password" 
          fullWidth 
          margin="normal" 
          required 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          onBlur={handlePasswordBlur}
          error={!!fieldErrors.password}
          helperText={fieldErrors.password || 'Min 8 chars: uppercase, lowercase, number, special char'}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Register</Button>
      </form>
    </Box>
  );
};

export default Register;
