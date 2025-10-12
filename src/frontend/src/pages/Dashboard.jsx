import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, TextField } from '@mui/material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext.jsx';
import { PlanContext } from '../context/PlanContext.jsx';
import SavedTendersList from '../components/SavedTendersList';
import WorkspaceAnalytics from '../components/WorkspaceAnalytics';
import TenderDocumentUpload from '../components/TenderDocumentUpload';
import TeamActivityFeed from '../components/TeamActivityFeed';

const Dashboard = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useContext(AuthContext);
  const { plan } = useContext(PlanContext);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const res = await api.get('/enriched-releases', { params: { teamId: user?.teamId } });
        setTenders(res.data);
      } catch (err) {
        setError('Failed to load tenders');
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, [user]);
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
      ["Title", "Deadline", "Match Score", "Status", "Notes", "Assigned To"],
      ...filtered.map(t => [t.title, t.deadline, t.match_score, t.status, t.notes, t.assigned_to])
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
        doc.text(`Title: ${t.title || ''}`, 10, y);
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

// Simple error boundary wrapper
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // Log error if needed
  }
  render() {
    if (this.state.hasError) {
      return <Alert severity="error">Something went wrong in the dashboard.</Alert>;
    }
    return this.props.children;
  }
}

  return (
    <ErrorBoundary>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField label="Filter by Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} sx={{ width: 180 }} />
          <Typography variant="h4" gutterBottom>Workspace Dashboard</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" href="/search">Search Tenders</Button>
          <Button variant="outlined" href="/profile">Company Profile</Button>
          <Button variant="outlined" href="/team">Team</Button>
          <Button variant="outlined" href="/plan">Plan</Button>
          <Button variant="contained" color="success" onClick={handleExport}>Export Workspace (CSV/PDF)</Button>
        </Box>
  <WorkspaceAnalytics tenders={tenders} />
  <TenderDocumentUpload />
  <TeamActivityFeed />
  <SavedTendersList />
      </Box>
    </ErrorBoundary>
  );
};

export default Dashboard;
