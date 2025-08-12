import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { BarChart } from '@mui/x-charts';
import { formatNumber } from './formatters';

export default function SalesByProductBar({ productNames, unitsSold, stock }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Units Sold vs Stock by Product</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            width: '100%',
            height: { xs: 240, sm: 280, md: 320 },
            '& .MuiBarElement-root': { rx: 0 },
            '& .MuiBarElement-root[data-series-id="sold"]': { rx: 12 },
            '& .MuiChartsAxis-line': { strokeOpacity: 0.2 },
            '& .MuiChartsGrid-line': { strokeOpacity: 0.2 },
            '& .MuiChartsTooltip-paper': (t) => ({
              backgroundColor: t.palette.mode === 'dark' ? 'rgba(20,20,20,0.92)' : 'rgba(255,255,255,0.92)',
              color: t.palette.text.primary,
              borderRadius: 8
            })
          }}
        >
          <BarChart
            xAxis={[{ scaleType: 'band', data: productNames }]}
            series={[
              { id: 'stock', data: stock, label: 'In Stock', stack: 'total', valueFormatter: (v) => formatNumber(v) },
              { id: 'sold', data: unitsSold, label: 'Sold', stack: 'total', valueFormatter: (v) => formatNumber(v) },
            ]}
            yAxis={[{ valueFormatter: formatNumber }]}
            grid={{ horizontal: true }}
            margin={{ top: 10, right: 10, bottom: 40, left: 50 }}
            height={320}
            borderRadius={5}
            slotProps={{ legend: { direction: 'row' } }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}


