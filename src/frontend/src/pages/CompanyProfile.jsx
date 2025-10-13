import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, Alert } from '@mui/material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext.jsx';

const CompanyProfile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [planUpgrading, setPlanUpgrading] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    industry_sector: '',
    services_provided: '',
    certifications: '',
    geographic_coverage: '',
    years_experience: '',
    contact_info: ''
  });
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/company-profile');
        setProfile(res.data);
        setForm(res.data);
      } catch (err) {
        setProfile(null);
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail;
        if (status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (status === 404) {
          setError('No company profile found. Please create one.');
        } else if (status === 403) {
          setError(detail || 'Your current plan does not allow access to company profile.');
        } else {
          setError(detail || 'Could not load company profile.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const upgradePlanToBasic = async () => {
    setPlanUpgrading(true);
    try {
      await api.put('/team/plan', { new_plan: 'basic' });
      setError('Plan upgraded to Basic. You can now create or update your company profile.');
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to upgrade plan.');
    } finally {
      setPlanUpgrading(false);
    }
  };
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = async () => {
    setLoading(true);
    try {
      const safeParseJSON = (value) => {
        if (!value) return {};
        if (typeof value === 'object') return value;
        try {
          return JSON.parse(value);
        } catch {
          // Fallback: wrap raw string in an object to satisfy backend JSON field
          return { value: value.toString() };
        }
      };

      const payload = {
        company_name: form.company_name,
        industry_sector: form.industry_sector,
        services_provided: Array.isArray(form.services_provided)
          ? form.services_provided
          : (form.services_provided || '')
              .split(',')
              .map(item => item.trim())
              .filter(Boolean),
        certifications: typeof form.certifications === 'object'
          ? form.certifications
          : safeParseJSON(form.certifications),
        geographic_coverage: Array.isArray(form.geographic_coverage)
          ? form.geographic_coverage
          : (form.geographic_coverage || '')
              .split(',')
              .map(item => item.trim())
              .filter(Boolean),
        years_experience: Number.parseInt(form.years_experience, 10) || 0,
        contact_info: typeof form.contact_info === 'object'
          ? form.contact_info
          : safeParseJSON(form.contact_info),
      };

      let res;
      if (profile) {
        res = await api.put('/company-profile', payload);
      } else {
        res = await api.post('/company-profile', payload);
      }
      setProfile(res.data);
      setEditMode(false);
      setError('');
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (status === 403) {
        setError(detail || 'This action is not allowed by your current plan.');
      } else {
        setError(detail || 'Failed to save profile');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Company Profile</Typography>
      {loading ? <CircularProgress /> : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
              {error.toLowerCase().includes('plan') && (
                <Button size="small" sx={{ ml: 2 }} disabled={planUpgrading} onClick={upgradePlanToBasic} variant="outlined">
                  {planUpgrading ? 'Upgrading…' : 'Upgrade plan to Basic'}
                </Button>
              )}
            </Alert>
          )}
          {(editMode || !profile) ? (
            <>
              <TextField label="Company Name" name="company_name" value={form.company_name || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
              <TextField label="Industry Sector" name="industry_sector" value={form.industry_sector || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
              <TextField label="Services Provided (comma separated)" name="services_provided" value={form.services_provided || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
              <TextField label="Certifications (JSON)" name="certifications" value={form.certifications || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
              <TextField label="Geographic Coverage (comma separated)" name="geographic_coverage" value={form.geographic_coverage || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
              <TextField label="Years of Experience" name="years_experience" value={form.years_experience || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
              <TextField label="Contact Information (JSON)" name="contact_info" value={form.contact_info || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
              <Button variant="contained" onClick={handleSave}>{profile ? 'Save' : 'Create'}</Button>
            </>
          ) : (
            <>
              <Typography>Company Name: {profile.company_name}</Typography>
              <Typography>Industry Sector: {profile.industry_sector}</Typography>
              <Typography>Services Provided: {Array.isArray(profile.services_provided) ? profile.services_provided.join(', ') : profile.services_provided}</Typography>
              <Typography>Certifications: {typeof profile.certifications === 'object' ? JSON.stringify(profile.certifications) : profile.certifications}</Typography>
              <Typography>Geographic Coverage: {Array.isArray(profile.geographic_coverage) ? profile.geographic_coverage.join(', ') : profile.geographic_coverage}</Typography>
              <Typography>Years of Experience: {profile.years_experience}</Typography>
              <Typography>Contact Information: {typeof profile.contact_info === 'object' ? JSON.stringify(profile.contact_info) : profile.contact_info}</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setEditMode(true)}>Edit Profile</Button>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default CompanyProfile;
