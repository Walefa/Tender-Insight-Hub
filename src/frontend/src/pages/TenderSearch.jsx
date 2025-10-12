import React, { useState } from 'react';

import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import api from '../utils/api';


const TenderSearch = () => {
  const [keyword, setKeyword] = useState('');
  const [province, setProvince] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    try {
      // GET to /tenders/search with supported filters
      const res = await api.get('/tenders/search', {
        params: {
          keyword,
          province,
          date_from: dateFrom,
          date_to: dateTo
        }
      });
      if (res.data && Array.isArray(res.data)) {
        setResults(res.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError('Search failed: ' + (err?.message || 'Unknown error'));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Tender Search (with Filters)</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField label="Keyword" variant="outlined" value={keyword} onChange={e => setKeyword(e.target.value)} />
        <TextField label="Province" variant="outlined" value={province} onChange={e => setProvince(e.target.value)} />
        <TextField label="Date From (YYYY-MM-DD)" variant="outlined" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <TextField label="Date To (YYYY-MM-DD)" variant="outlined" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <>
          {results && results.length === 0 ? <Typography>No tenders found.</Typography> : (
            (results || []).map(tender => (
              <TenderResultCard key={tender.id || tender.ocid} tender={tender} />
            ))
          )}
        </>
      )}
    </Box>
  );
};


function TenderResultCard({ tender }) {
  const [summary, setSummary] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [matchResult, setMatchResult] = React.useState(null);
  const [matchLoading, setMatchLoading] = React.useState(false);
  const [matchError, setMatchError] = React.useState('');

  const handleGetSummary = async () => {
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const res = await api.get(`/tenders/${tender.id}/summary`);
      setSummary(res.data.summary);
    } catch {
      setError('Failed to fetch AI summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchTender = async () => {
    setMatchLoading(true);
    setMatchError('');
    setMatchResult(null);
    try {
      const res = await api.post('/tenders/readiness-check', {
        tender_id: tender.id,
        company_profile_id: null // Replace with actual ID if needed
      });
      setMatchResult(res.data);
    } catch {
      setMatchError('Failed to match tender.');
    } finally {
      setMatchLoading(false);
    }
  };

  // Safely render buyer and value fields
  const buyerName = tender.buyer && typeof tender.buyer === 'object' ? tender.buyer.name : tender.buyer;
  const budgetValue = tender.value && typeof tender.value === 'object' ? tender.value.amount || JSON.stringify(tender.value) : tender.value;
  return (
    <Box sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
      <Typography variant="h6">{tender.title}</Typography>
      <Typography>Description: {tender.description}</Typography>
      <Typography>Status: {tender.status}</Typography>
      <Typography>Deadline: {tender.tenderPeriod && tender.tenderPeriod.endDate ? tender.tenderPeriod.endDate : ''}</Typography>
      <Typography>Buyer: {buyerName}</Typography>
      <Typography>Budget: {budgetValue}</Typography>
      <Typography>Match Score: {tender.match_score}</Typography>
      <Button
        variant="outlined"
        sx={{ mt: 1, mr: 2 }}
        onClick={async () => {
          try {
            await api.post('/workspace', {
              tender_id: tender.id,
              status: 'pending',
              notes: '',
            });
            alert('Tender saved to workspace!');
          } catch {
            alert('Failed to save tender.');
          }
        }}
      >
        Save to Workspace
      </Button>
      <Button
        variant="contained"
        sx={{ mt: 1 }}
        onClick={handleGetSummary}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'AI Summary'}
      </Button>
      <Button
        variant="outlined"
        sx={{ mt: 1, ml: 2 }}
        onClick={handleMatchTender}
        disabled={matchLoading}
      >
        {matchLoading ? 'Matching...' : 'Match Tender'}
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {summary && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
          <Typography variant="subtitle1">AI Summary:</Typography>
          <Typography>{summary}</Typography>
        </Box>
      )}
      {matchError && <Alert severity="error" sx={{ mt: 2 }}>{matchError}</Alert>}
      {matchResult && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
          <Typography variant="subtitle1">Readiness Score: {matchResult.suitability_score}</Typography>
          <Typography>Recommendation: {matchResult.recommendation}</Typography>
          <Typography>Checklist:</Typography>
          <ul>
            {Object.entries(matchResult.checklist || {}).map(([key, value]) => (
              <li key={key}>{key}: {value ? '✔️' : '❌'}</li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
}

export default TenderSearch;
