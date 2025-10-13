import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, Alert, IconButton, Tooltip, Paper, Stack, Divider } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext.jsx';

const TeamManagement = () => {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get('/team/members');
        setMembers(res.data || []);
        const invitesRes = await api.get('/team/invitations');
        setInvitations(invitesRes.data || []);
      } catch (err) {
        const msg = err?.response?.data?.detail || 'Failed to load team members or invitations';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [user]);
  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await api.post('/team/invitations', { email: inviteEmail });
      setInviteEmail('');
      setInvitations(prev => [res.data, ...(prev || [])]);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to send invitation';
      setError(msg);
    } finally {
      setInviting(false);
    }
  };
  const revokeInvitation = async (invitationId) => {
    try {
      await api.delete(`/team/invitations/${invitationId}`);
      setInvitations(prev => (prev || []).filter(inv => inv.id !== invitationId));
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to revoke invitation';
      setError(msg);
    }
  };
  const copyToken = async (token) => {
    try {
      await navigator.clipboard.writeText(token);
      alert('Invitation token copied to clipboard');
    } catch {}
  };
  const copyInviteLink = async (token) => {
    try {
      const origin = window.location.origin;
      const link = `${origin}/invite/accept?token=${encodeURIComponent(token)}`;
      await navigator.clipboard.writeText(link);
      alert('Invitation link copied to clipboard');
    } catch {}
  };
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Team Management</Typography>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Team Members</Typography>
            {(members || []).map(member => (
              <Box key={member.id} sx={{ mb: 1 }}>
                <Typography>{member.full_name} ({member.email})</Typography>
              </Box>
            ))}
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Invite a Member</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Invite by Email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} sx={{ maxWidth: 360 }} />
              <Button variant="contained" disabled={inviting} onClick={handleInvite}>
                {inviting ? 'Sending…' : 'Invite Member'}
              </Button>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Invitations</Typography>
            {(invitations || []).length === 0 ? (
              <Typography variant="body2">No invitations yet.</Typography>
            ) : (
              (invitations || []).map(invite => (
                <Box key={invite.id} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography sx={{ minWidth: 240 }}>{invite.email}</Typography>
                  <Typography sx={{ minWidth: 120 }}>Status: {invite.status}</Typography>
                  <Tooltip title="Copy invite token">
                    <IconButton size="small" onClick={() => copyToken(invite.token)}>
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy invite link">
                    <IconButton size="small" onClick={() => copyInviteLink(invite.token)}>
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  {invite.status === 'pending' && (
                    <Button variant="outlined" color="error" onClick={() => revokeInvitation(invite.id)}>Revoke</Button>
                  )}
                </Box>
              ))
            )}
          </Paper>
        </>
      )}
    </Stack>
  );
};

export default TeamManagement;
