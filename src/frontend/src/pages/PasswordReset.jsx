import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const PasswordReset = () => {
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>Password Reset</Typography>
      <form>
        <TextField label="Email" fullWidth margin="normal" required />
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Send Reset Link</Button>
      </form>
    </Box>
  );
};

export default PasswordReset;
