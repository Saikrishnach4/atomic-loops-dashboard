import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { LineChart } from '@mui/x-charts';
import { formatNumber, sessionsColors } from './formatters';

export default function SessionsCard({ sessions, totalSessions, percentChange }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">Sessions</Typography>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>{totalSessions.toLocaleString()}</Typography>
          </Box>
          <Chip label={`${percentChange >= 0 ? '+' : ''}${percentChange}%`} color={percentChange >= 0 ? 'success' : 'error'} size="small" sx={{ fontWeight: 600 }} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Sessions per day for the last {sessions.length} days
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <LineChart
            dataset={sessions}
            xAxis={[{ dataKey: 'date', scaleType: 'point' }]}
            yAxis={[{ valueFormatter: formatNumber }]}
            series={[
              { dataKey: 'paid', label: 'Paid', stack: 'total', area: true, curve: 'monotoneX' },
              { dataKey: 'referral', label: 'Referral', stack: 'total', area: true, curve: 'monotoneX' },
              { dataKey: 'organic', label: 'Organic', stack: 'total', area: true, curve: 'monotoneX' },
            ]}
            colors={sessionsColors}
            grid={{ horizontal: true }}
            margin={{ top: 10, right: 20, bottom: 20, left: 50 }}
            height={300}
          />
        </Box>
      </CardContent>
    </Card>
  );
}


