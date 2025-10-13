import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Alert,
  IconButton
} from "@mui/material";
import Chip from "@mui/material/Chip";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import api from "../utils/api";

const savedTendersMock = [];

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "interested", label: "Interested" },
  { value: "not_eligible", label: "Not Eligible" },
  { value: "submitted", label: "Submitted" }
];

const SavedTendersList = ({ onLoaded }) => {
  const [tenders, setTenders] = useState(savedTendersMock);
  const [editingTenderId, setEditingTenderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // recalc readiness removed
  const [sortBy, setSortBy] = useState('readiness_desc');

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const fetchTenders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/workspace');
        const items = res.data;
        setTenders(items);
        if (typeof onLoaded === 'function') {
          onLoaded(items);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load saved tenders');
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, []);

  const handleStatusChange = (tenderId, newStatus) => {
    setTenders(prev => prev.map(t => t.id === tenderId ? { ...t, status: newStatus } : t));
  };

  const handleNotesChange = (tenderId, notes) => {
    setTenders(prev => prev.map(t => t.id === tenderId ? { ...t, notes } : t));
  };

  const handleSaveChanges = async (tenderId) => {
    const tenderToSave = tenders.find(t => t.id === tenderId);
    try {
      await api.put(`/workspace/${tenderId}`, {
        status: tenderToSave.status,
        notes: tenderToSave.notes,
      });
      setEditingTenderId(null);
      if (typeof onLoaded === 'function') onLoaded(tenders);
    } catch (err) {
      console.error(err);
      setError('Failed to update tender');
    }
  };

  const filteredTenders = statusFilter === "all" ? tenders : tenders.filter(t => t.status === statusFilter);

  const sortedTenders = useMemo(() => {
    const arr = [...filteredTenders];
    const getScore = (t) => (typeof t?.suitability_score === 'number' ? t.suitability_score : null);
    arr.sort((a, b) => {
      const aScore = getScore(a);
      const bScore = getScore(b);
      if (aScore === null && bScore === null) return 0;
      if (aScore === null) return 1; // unscored last
      if (bScore === null) return -1;
      return sortBy === 'readiness_desc' ? bScore - aScore : aScore - bScore;
    });
    return arr;
  }, [filteredTenders, sortBy]);

  // recalc readiness handler removed

  const scoreChip = (score) => {
    if (typeof score !== 'number') return <Chip size="small" label="Not scored" variant="outlined" />;
    const color = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
    return <Chip size="small" color={color} label={`${score}%`} />;
  };

  const handleDelete = async (tenderId) => {
    if (!window.confirm('Remove this tender from workspace?')) return;
    try {
      await api.delete(`/workspace/${tenderId}`);
      setTenders(prev => {
        const updated = prev.filter(t => t.id !== tenderId);
        if (typeof onLoaded === 'function') onLoaded(updated);
        return updated;
      });
    } catch (err) {
      console.error(err);
      setError('Failed to delete tender');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Saved Tenders
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {statusOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Sort by</InputLabel>
          <Select value={sortBy} label="Sort by" onChange={e => setSortBy(e.target.value)}>
            <MenuItem value="readiness_desc">Readiness (High → Low)</MenuItem>
            <MenuItem value="readiness_asc">Readiness (Low → High)</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined">Export Workspace</Button>
      </Box>
      <List>
        {sortedTenders.map(tender => (
          <ListItem key={tender.id} sx={{ mb: 2 }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {tender.tender_id}
                  </Typography>
                  {scoreChip(tender.suitability_score)}
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2">Status: {tender.status || 'Not set'}</Typography>
                  <Typography variant="body2">Notes: {tender.notes || 'No notes'}</Typography>
                  <Typography variant="body2">Assigned To: {tender.assigned_to || 'Unassigned'}</Typography>
                  <TextField
                    label="Update Notes"
                    multiline
                    rows={3}
                    value={tender.notes || ''}
                    onChange={e => handleNotesChange(tender.id, e.target.value)}
                    sx={{ mt: 1, maxWidth: 360 }}
                  />
                </>
              }
            />
            <ListItemSecondaryAction>
              <FormControl sx={{ minWidth: 160 }} size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={tender.status || 'pending'}
                  label="Status"
                  onChange={e => handleStatusChange(tender.id, e.target.value)}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton edge="end" aria-label="edit" color="primary" onClick={() => setEditingTenderId(tender.id)} sx={{ mt: 1 }}>
                <EditIcon />
              </IconButton>
              {editingTenderId === tender.id && (
                <IconButton edge="end" aria-label="save" color="success" onClick={() => handleSaveChanges(tender.id)}>
                  <SaveIcon />
                </IconButton>
              )}
              {/* Recalculate readiness removed */}
              <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDelete(tender.id)} sx={{ mt: 1 }}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default SavedTendersList;
