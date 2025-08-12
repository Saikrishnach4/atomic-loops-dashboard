import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { LineChart } from '@mui/x-charts';
import { formatNumber, revenueColors } from './formatters';

// Expects dataset: [{ date, revenue, units }]
export default function RevenueTrendArea({ dataset, totalRevenue, changePercent }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">Revenue</Typography>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>{formatNumber(totalRevenue)}</Typography>
          </Box>
          <Typography variant="caption" color={changePercent >= 0 ? 'success.main' : 'error.main'}>
            {changePercent >= 0 ? '+' : ''}{changePercent}%
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Revenue per day (aggregated from product sales)
        </Typography>
        <Box sx={{ width: '100%', height: { xs: 220, sm: 260, md: 300 } }}>
          <LineChart

            dataset={dataset}
            xAxis={[{ dataKey: 'date', scaleType: 'point' }]}
            yAxis={[{ valueFormatter: formatNumber }]}
            series={[{ dataKey: 'revenue', label: 'Revenue', area: true, curve: 'monotoneX' }]}
            colors={revenueColors}
            grid={{ horizontal: true }}
            margin={{ top: 10, right: 20, bottom: 20, left: 50 }}
            height={300}
          />
        </Box>
      </CardContent>
    </Card>
  );
}


