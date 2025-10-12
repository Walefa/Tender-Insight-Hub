import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const ApiDocs = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>API Documentation</Typography>
      <Link href="/api/docs" target="_blank" rel="noopener">View Swagger/OpenAPI Docs</Link>
    </Box>
  );
};

export default ApiDocs;
