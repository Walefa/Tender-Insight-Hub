import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, Alert } from '@mui/material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext.jsx';

const TeamManagement = () => {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get('/team/members');
        setMembers(res.data);
        const invitesRes = await api.get('/team/invites');
        setPendingInvites(invitesRes.data);
      } catch (err) {
        setError('Failed to load team members or invites');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [user]);
  const handleInvite = async () => {
    setLoading(true);
    try {
      await api.post('/team/invite', { email: inviteEmail });
      setInviteEmail('');
      // Optionally refresh members list
    } catch (err) {
      setError('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Team Management</Typography>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <>
          <Typography variant="h6">Team Members</Typography>
          {members.map(member => (
            <Box key={member.id} sx={{ mb: 1 }}>
              <Typography>{member.name} ({member.email}) - {member.role}</Typography>
            </Box>
          ))}
          <Box sx={{ mt: 2 }}>
            <TextField label="Invite by Email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            <Button variant="contained" sx={{ ml: 2 }} onClick={handleInvite}>Invite Member</Button>
          </Box>
          <Typography variant="h6" sx={{ mt: 4 }}>Pending Invitations</Typography>
          {pendingInvites.map(invite => (
            <Box key={invite.id} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>{invite.email}</Typography>
              <Button variant="outlined" color="success" onClick={async () => {
                try {
                  await api.post('/team/invite/accept', { inviteId: invite.id });
                  // Optionally refresh invites
                } catch {}
              }}>Accept</Button>
              <Button variant="outlined" color="error" onClick={async () => {
                try {
                  await api.post('/team/invite/decline', { inviteId: invite.id });
                  // Optionally refresh invites
                } catch {}
              }}>Decline</Button>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

export default TeamManagement;
