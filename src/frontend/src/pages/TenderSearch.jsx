import React, { useState, useEffect } from 'react';

import { Box, Typography, TextField, Button, CircularProgress, Alert, Chip, Paper, Stack, Divider } from '@mui/material';
import api from '../utils/api';


const TenderSearch = () => {
  const [keyword, setKeyword] = useState('');
  const [province, setProvince] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileId, setProfileId] = useState(null);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let ignore = false;
    const loadProfile = async () => {
      try {
        const res = await api.get('/company-profile');
        if (!ignore) {
          setProfileId(res.data?.id ?? null);
          setProfileError('');
        }
      } catch (err) {
        if (!ignore) {
          setProfileId(null);
          if (err?.response?.status === 404) {
            setProfileError('Create a company profile to enable readiness checks.');
          } else {
            setProfileError('Could not load company profile.');
          }
        }
      }
    };
    loadProfile();
    return () => {
      ignore = true;
    };
  }, []);
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
        const normalised = res.data.map((release) => {
          const tenderInfo = release.tender || {};
          const tenderId = tenderInfo.id || release.id || release.ocid || '';
          const tenderPeriod = tenderInfo.tenderPeriod || release.tenderPeriod || {};
          const buyerInfo = tenderInfo.procuringEntity || tenderInfo.buyer || release.buyer || {};
          const valueInfo = tenderInfo.value || release.value || {};

          return {
            id: tenderId || release.ocid,
            ocid: release.ocid,
            tenderId,
            title: tenderInfo.title || release.title || 'Untitled tender',
            description: tenderInfo.description || release.description || 'No description provided.',
            status: tenderInfo.status || release.status || 'Unknown',
            deadline: tenderPeriod.endDate || tenderPeriod.closingDate || '',
            buyerName: buyerInfo.name || buyerInfo || 'Unknown buyer',
            budget: valueInfo.amount || valueInfo.value || '',
            matchScore: release.match_score,
            raw: release,
          };
        });
        setResults(normalised);
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
      {profileError && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {profileError}
        </Alert>
      )}
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <>
          {results && results.length === 0 ? (
            <Alert severity="info">No tenders found. If this persists, the source service may be temporarily unavailable.</Alert>
          ) : (
            (results || []).map(tender => (
              <TenderResultCard
                key={tender.id || tender.ocid}
                tender={tender}
                profileId={profileId}
                profileError={profileError}
              />
            ))
          )}
        </>
      )}
    </Box>
  );
};


function TenderResultCard({ tender, profileId, profileError }) {
  const [summary, setSummary] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [matchResult, setMatchResult] = React.useState(null);
  const [matchLoading, setMatchLoading] = React.useState(false);
  const [matchError, setMatchError] = React.useState('');
  const readinessScore = matchResult?.suitability_score;

  const handleGetSummary = async () => {
    setLoading(true);
    setError('');
    setSummary('');
    try {
  const summaryId = tender.tenderId || tender.ocid || tender.id;
  const res = await api.get(`/tenders/${summaryId}/summary`);
      setSummary(res.data.summary);
    } catch {
      setError('Failed to fetch AI summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchTender = async () => {
    if (!profileId) {
      setMatchError(profileError || 'Please create a company profile before running readiness checks.');
      return;
    }

    setMatchLoading(true);
    setMatchError('');
    setMatchResult(null);
    try {
      const res = await api.post('/readiness-check', {
        // Prefer OCID for the eTenders release endpoint; fall back to ids
        tender_id: tender.ocid || tender.tenderId || tender.id,
        company_profile_id: profileId
      });
      setMatchResult(res.data);
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 404 && detail) {
        setMatchError(detail);
      } else if (status === 403 && detail) {
        setMatchError(detail);
      } else if (err?.code === 'ERR_NETWORK') {
        setMatchError('Cannot reach backend. Is the API server running?');
      } else {
        setMatchError(detail || 'Failed to match tender.');
      }
    } finally {
      setMatchLoading(false);
    }
  };

  // Safely render buyer and value fields
  const buyerName = tender.buyerName || 'Unknown buyer';
  const budgetValue = tender.budget ? `R ${tender.budget}` : 'Not specified';
  return (
    <Paper elevation={2} sx={{ mb: 3, p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{tender.title}</Typography>
        {tender.raw && tender.raw._offline && (
          <Chip size="small" color="warning" label="Sample data" />
        )}
        {typeof readinessScore === 'number' && (
          <Chip size="small" color="success" label={`Readiness: ${readinessScore}%`} />
        )}
      </Stack>
      <Typography sx={{ mt: 1 }} color="text.secondary">{tender.description}</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
        {tender.ocid && (
          <Typography variant="caption" color="text.secondary">OCID: {tender.ocid}</Typography>
        )}
        <Typography variant="body2">Status: <b>{tender.status}</b></Typography>
        <Typography variant="body2">Deadline: <b>{tender.deadline || 'Not specified'}</b></Typography>
        <Typography variant="body2">Buyer: <b>{buyerName}</b></Typography>
        <Typography variant="body2">Budget: <b>{budgetValue}</b></Typography>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button
          variant="outlined"
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
          onClick={handleGetSummary}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'AI Summary'}
        </Button>
        <Button
          variant="outlined"
          onClick={handleMatchTender}
          disabled={matchLoading}
        >
          {matchLoading ? 'Matching...' : 'Match Tender'}
        </Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {summary && (
        <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle1">AI Summary</Typography>
          <Typography sx={{ mt: 0.5 }}>{summary}</Typography>
        </Paper>
      )}
      {matchError && <Alert severity="error" sx={{ mt: 2 }}>{matchError}</Alert>}
      {matchResult && (
        <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle1">Readiness</Typography>
          <Typography>Score: <b>{matchResult.suitability_score}</b></Typography>
          <Typography>Recommendation: {matchResult.recommendation}</Typography>
          <Typography sx={{ mt: 1 }}>Checklist:</Typography>
          <Box component="ul" sx={{ pl: 3, mt: 0.5 }}>
            {Object.entries(matchResult.checklist || {}).map(([key, value]) => (
              <li key={key}>{key}: {value ? '✔️' : '❌'}</li>
            ))}
          </Box>
        </Paper>
      )}
    </Paper>
  );
}

export default TenderSearch;
