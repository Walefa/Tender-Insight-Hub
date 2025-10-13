import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const TenderDetails = () => {
  const { id } = useParams();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');

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

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await api.post('/api/summary/extract', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          data: {
            file: 'path/to/your/file.pdf', // Replace with actual file path
          },
        });
        setSummary(response.data.summary);
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    }

    fetchSummary();
  }, []);

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
              const res = await api.post('/readiness-check', {
                tender_id: tender.id,
                company_profile_id: tender.company_profile?.id || 0
              });
              const { suitability_score, checklist, recommendation } = res.data;
              alert(
                'Suitability Score: ' + suitability_score +
                '\nChecklist: ' + JSON.stringify(checklist) +
                '\nRecommendation: ' + recommendation
              );
            } catch {}
          }}>Match This Tender</Button>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Fetched Summary:</Typography>
            <Typography>{summary}</Typography>
          </Box>
        </>
      ) : null}
    </Box>
  );
};

export default TenderDetails;
