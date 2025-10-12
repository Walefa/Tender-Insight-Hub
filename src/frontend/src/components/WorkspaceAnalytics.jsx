import React from 'react';
import { Box, Typography } from '@mui/material';
// For charting, use a simple library like recharts
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function WorkspaceAnalytics({ tenders }) {
  if (!Array.isArray(tenders) || tenders.length === 0) {
    return <Typography>No analytics available (no tenders).</Typography>;
  }

  // Status distribution
  const statusCounts = tenders.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({ name: status, value: count }));

  // Match score distribution (grouped)
  const scoreGroups = [
    { name: '80-100', min: 80, max: 100 },
    { name: '60-79', min: 60, max: 79 },
    { name: '40-59', min: 40, max: 59 },
    { name: '0-39', min: 0, max: 39 },
  ];
  const scoreData = scoreGroups.map(group => ({
    name: group.name,
    value: tenders.filter(t => t.match_score >= group.min && t.match_score <= group.max).length
  }));

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>Workspace Analytics</Typography>
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Box sx={{ width: 300, height: 300 }}>
          <Typography>Status Distribution</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ width: 300, height: 300 }}>
          <Typography>Match Score Distribution</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={scoreData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {scoreData.map((entry, idx) => <Cell key={`cell-score-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
}
