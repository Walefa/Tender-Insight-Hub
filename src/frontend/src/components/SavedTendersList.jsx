import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, TextField, Select, MenuItem } from '@mui/material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext.jsx';

const statusOptions = ["Pending", "Interested", "Not Eligible", "Submitted"];

export default function SavedTendersList() {
  const { user } = useContext(AuthContext);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const res = await api.get('/workspace');
        setTenders(res.data);
      } catch (err) {
        setError('Failed to load saved tenders');
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, [user]);

  const handleStatusChange = async (tenderId, newStatus) => {
    try {
      await api.put(`/workspace/${tenderId}`, { status: newStatus });
      setTenders(tenders => tenders.map(t => t.id === tenderId ? { ...t, status: newStatus } : t));
    } catch {
      setError('Failed to update status');
    }
  };

  const handleNoteChange = async (tenderId, newNote) => {
    try {
      await api.put(`/workspace/${tenderId}`, { notes: newNote });
      setTenders(tenders => tenders.map(t => t.id === tenderId ? { ...t, notes: newNote } : t));
    } catch {
      setError('Failed to update notes');
    }
  };

  const handleTaskAssign = async (tenderId, assignedTo) => {
    try {
      await api.put(`/workspace/${tenderId}`, { assigned_to: assignedTo });
      setTenders(tenders => tenders.map(t => t.id === tenderId ? { ...t, assigned_to: assignedTo } : t));
    } catch {
      setError('Failed to assign task');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Saved Tenders</Typography>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        tenders.length === 0 ? <Typography>No saved tenders yet.</Typography> : (
          tenders.sort((a, b) => b.match_score - a.match_score).map(tender => (
            <Box key={tender.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
              <Typography variant="h6">{tender.title}</Typography>
              <Typography>Deadline: {tender.deadline}</Typography>
              <Typography>Match Score: {tender.match_score}</Typography>
              <Typography>Status: {tender.status}</Typography>
              <Typography>Changed by: {tender.changed_by}</Typography>
              <Typography>AI Summary: {tender.ai_summary}</Typography>
              <Select
                value={tender.status}
                onChange={e => handleStatusChange(tender.id, e.target.value)}
                sx={{ minWidth: 120, mt: 1 }}
              >
                {statusOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
              <TextField
                label="Notes"
                value={tender.notes || ''}
                onChange={e => handleNoteChange(tender.id, e.target.value)}
                multiline
                minRows={2}
                sx={{ mt: 2, width: '100%' }}
              />
              <TextField
                label="Assign Task To"
                value={tender.assigned_to || ''}
                onChange={e => handleTaskAssign(tender.id, e.target.value)}
                sx={{ mt: 2, width: '100%' }}
              />
            </Box>
          ))
        )
      )}
    </Box>
  );
}
