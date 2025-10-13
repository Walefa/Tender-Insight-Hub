import React, { useState } from 'react';

import { Box, Typography, Alert, Button, TextField, Paper, Stack, Divider } from '@mui/material';
import SavedTendersList from '../components/SavedTendersList';
import TenderDocumentUpload from '../components/TenderDocumentUpload';
import TeamActivityFeed from '../components/TeamActivityFeed';

// Simple error boundary wrapper (defined outside component to keep identity stable across renders)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // Optionally log
  }
  render() {
    if (this.state.hasError) {
      return <Alert severity="error">Something went wrong in the dashboard.</Alert>;
    }
    return this.props.children;
  }
}

const Dashboard = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [tenders, setTenders] = useState([]);
  const handleExport = () => {
    // Export filtered tenders as CSV or PDF
    let filtered = tenders;
    if (statusFilter) {
      filtered = tenders.filter(t => t.status === statusFilter);
    }
    if (!Array.isArray(filtered) || filtered.length === 0) {
      alert("No tenders to export.");
      return;
    }
    // CSV Export
    const csvRows = [
      ["Tender ID", "Deadline", "Match Score", "Status", "Notes", "Assigned To"],
      ...filtered.map(t => [t.tender_id, t.deadline || '', t.match_score ?? '', t.status || '', t.notes || '', t.assigned_to || ''])
    ];
    const csvContent = csvRows.map(row => row.map(String).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "workspace_tenders.csv";
    a.click();
    URL.revokeObjectURL(url);
    // PDF Export
    import('jspdf').then(jsPDFModule => {
      const { jsPDF } = jsPDFModule;
      const doc = new jsPDF();
      doc.text('Workspace Tenders', 10, 10);
      let y = 20;
      filtered.forEach(t => {
        doc.text(`Tender ID: ${t.tender_id || ''}`, 10, y);
        doc.text(`Deadline: ${t.deadline || ''}`, 10, y + 6);
        doc.text(`Match Score: ${t.match_score || ''}`, 10, y + 12);
        doc.text(`Status: ${t.status || ''}`, 10, y + 18);
        doc.text(`Notes: ${t.notes || ''}`, 10, y + 24);
        doc.text(`Assigned To: ${t.assigned_to || ''}`, 10, y + 30);
        y += 40;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      doc.save('workspace_tenders.pdf');
    });
  };

  return (
    <ErrorBoundary>
      <Stack spacing={3}>
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>Workspace Dashboard</Typography>
            <TextField label="Filter by Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} sx={{ width: { xs: '100%', md: 220 } }} />
            <Button variant="outlined" href="/search">Search Tenders</Button>
            <Button variant="outlined" href="/profile">Company Profile</Button>
            <Button variant="outlined" href="/team">Team</Button>
            <Button variant="outlined" href="/plan">Plan</Button>
            <Button variant="contained" color="success" onClick={handleExport}>Export CSV/PDF</Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Upload Tender Documents</Typography>
          <TenderDocumentUpload />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Team Activity</Typography>
          <TeamActivityFeed />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Saved Tenders</Typography>
          <Divider sx={{ mb: 2 }} />
          <SavedTendersList onLoaded={setTenders} />
        </Paper>
      </Stack>
    </ErrorBoundary>
  );
};

export default Dashboard;
