import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const TenderDetails = () => {
  const { id } = useParams();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchTender = async () => {
      try {
        const res = await api.get(`/enriched-releases/${id}`);
        setTender(res.data);
      } catch (err) {
        setError('Failed to load tender details');
      } finally {
        setLoading(false);
      }
    };
    fetchTender();
  }, [id]);
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Tender Details</Typography>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : tender ? (
        <>
          <Typography variant="h6">{tender.title}</Typography>
          <Typography>Deadline: {tender.deadline}</Typography>
          <Typography>Buyer: {tender.buyer}</Typography>
          <Typography>Budget: {tender.budget}</Typography>
          <Typography>AI Summary: {tender.ai_summary}</Typography>
          <Typography>Readiness Score: {tender.readiness_score}</Typography>
          <Typography>Checklist: {tender.checklist}</Typography>
          <Typography>Recommendation: {tender.recommendation}</Typography>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const formData = new FormData();
                  formData.append('file', file);
                  try {
                    const res = await api.post('/summary/extract', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    // Display summary from response
                    alert('AI Summary: ' + res.data.summary);
                  } catch {}
                }
              }}
            />
          </Box>
          <Button variant="contained" sx={{ mt: 2 }} onClick={async () => {
            try {
              const res = await api.post('/readiness/check', {
                tenderId: tender.id,
                companyProfile: tender.company_profile // or fetch from user context
              });
              alert('Suitability Score: ' + res.data.score + '\nChecklist: ' + res.data.checklist + '\nRecommendation: ' + res.data.recommendation);
            } catch {}
          }}>Match This Tender</Button>
        </>
      ) : null}
    </Box>
  );
};

export default TenderDetails;
