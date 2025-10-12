import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';

export default function TeamActivityFeed() {
  const [loading, setLoading] = useState(true);

  // Team activities endpoint does not exist in backend. Show placeholder only.
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>Team Activity Feed</Typography>
      {loading ? <CircularProgress /> : (
        <Typography>No recent team activities.</Typography>
      )}
    </Box>
  );
}
