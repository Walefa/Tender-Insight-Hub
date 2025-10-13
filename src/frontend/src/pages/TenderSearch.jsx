import React, { useState, useEffect } from 'react';

import { Box, Typography, TextField, Button, CircularProgress, Alert, Chip } from '@mui/material';
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
    <Box sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h6">{tender.title}</Typography>
        {tender.raw && tender.raw._offline && (
          <Chip size="small" color="warning" label="Sample data" />
        )}
        {typeof readinessScore === 'number' && (
          <Chip size="small" color="success" label={`Readiness: ${readinessScore}%`} />
        )}
      </Box>
      <Typography>Description: {tender.description}</Typography>
      {tender.ocid && (
        <Typography variant="caption" color="text.secondary">OCID: {tender.ocid}</Typography>
      )}
      <Typography>Status: {tender.status}</Typography>
      <Typography>Deadline: {tender.deadline || 'Not specified'}</Typography>
      <Typography>Buyer: {buyerName}</Typography>
      <Typography>Budget: {budgetValue}</Typography>
      <Typography>
        Readiness Score: {typeof readinessScore === 'number' ? `${readinessScore}%` : 'Not scored yet'}
      </Typography>
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
