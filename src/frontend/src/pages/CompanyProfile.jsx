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
        setError('No company profile found. Please create one.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = async () => {
    setLoading(true);
    try {
      let res;
      if (profile) {
        res = await api.put('/company-profile', form);
      } else {
        res = await api.post('/company-profile', form);
      }
      setProfile(res.data);
      setEditMode(false);
      setError('');
    } catch (err) {
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Company Profile</Typography>
      {loading ? <CircularProgress /> : (
        <>
          {error && <Alert severity="error">{error}</Alert>}
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
