import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Stack, Grid, Card, CardHeader, CardContent, CardActions, List, ListItem, ListItemIcon, ListItemText, Divider, Radio, FormControlLabel } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext.jsx';

const PlanManagement = () => {
  const { user } = useContext(AuthContext);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const planConfigs = {
    free: {
      title: 'Free',
      subtitle: '1 user, 3 searches/week',
      features: [
        'Basic search functionality',
        'Limited to 3 searches per week',
        '1 team member',
      ],
    },
    basic: {
      title: 'Basic',
      subtitle: '3 users, unlimited searches',
      features: [
        'Unlimited searches',
        'Unlimited saved files',
        'AI summaries',
        'Readiness checks',
        'Up to 3 team members',
      ],
    },
    pro: {
      title: 'Pro',
      subtitle: 'Unlimited users, all features',
      features: [
        'All Basic features',
        'Unlimited team members',
        'Export reports',
        'Priority support',
      ],
    },
  };
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
    <Stack spacing={2}>
      <Typography variant="h4">Plan Management</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography>Current Plan: <b>{plan}</b></Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>Choose the right plan for your team</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {['free','basic','pro'].map((key) => {
              const cfg = planConfigs[key];
              const selected = selectedPlan === key;
              return (
                <Grid item xs={12} md={4} key={key}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderColor: selected ? 'primary.main' : 'divider',
                      boxShadow: selected ? 4 : 1,
                      transition: 'box-shadow .15s ease, transform .15s ease',
                      '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                    }}
                  >
                    <CardHeader
                      title={cfg.title}
                      subheader={cfg.subtitle}
                      titleTypographyProps={{ variant: 'h6' }}
                    />
                    <Divider />
                    <CardContent>
                      <List dense disablePadding>
                        {cfg.features.map((f, i) => (
                          <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircleOutlineIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={f} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <FormControlLabel
                        control={<Radio checked={selected} onChange={() => setSelectedPlan(key)} />}
                        label={`Select ${cfg.title}`}
                      />
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          <Box>
            <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleUpgrade}>Update Plan</Button>
          </Box>
        </>
      )}
    </Stack>
  );
};

export default PlanManagement;
