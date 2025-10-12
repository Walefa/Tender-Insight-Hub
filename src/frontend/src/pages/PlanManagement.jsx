import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext.jsx';

const PlanManagement = () => {
  const { user } = useContext(AuthContext);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get('/team/plan');
        setPlan(res.data.plan);
        setSelectedPlan(res.data.plan);
      } catch (err) {
        if (err?.response?.status === 403) {
          setError('You must be logged in to view and manage your team plan.');
        } else {
          setError('Failed to load plan');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [user]);
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await api.put('/team/plan', { new_plan: selectedPlan });
      setPlan(res.data.plan);
      setError('');
    } catch (err) {
      setError('Failed to update plan');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Plan Management</Typography>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <>
          <Typography>Current Plan: {plan}</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Choose a Subscription Plan:</Typography>
            <Button variant={selectedPlan === 'free' ? 'contained' : 'outlined'} sx={{ mr: 2 }} onClick={() => setSelectedPlan('free')}>Free</Button>
            <Button variant={selectedPlan === 'basic' ? 'contained' : 'outlined'} sx={{ mr: 2 }} onClick={() => setSelectedPlan('basic')}>Basic</Button>
            <Button variant={selectedPlan === 'pro' ? 'contained' : 'outlined'} onClick={() => setSelectedPlan('pro')}>Pro</Button>
          </Box>
          <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleUpgrade}>Update Plan</Button>
        </>
      )}
    </Box>
  );
};

export default PlanManagement;
