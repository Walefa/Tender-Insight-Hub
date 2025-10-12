import React, { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import api from '../utils/api';

export default function TenderDocumentUpload() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummary('');
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/summary/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSummary(res.data.summary);
    } catch (err) {
      setError('Failed to summarize document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>AI Tender Document Summarization</Typography>
      <input type="file" accept=".pdf,.docx,.zip" onChange={handleFileChange} />
      <Button variant="contained" sx={{ ml: 2 }} onClick={handleUpload} disabled={!file || loading}>Upload & Summarize</Button>
      {loading && <CircularProgress sx={{ ml: 2 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {summary && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
          <Typography variant="h6">AI Summary:</Typography>
          <Typography>{summary}</Typography>
        </Box>
      )}
    </Box>
  );
}
