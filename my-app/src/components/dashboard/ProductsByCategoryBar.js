import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { BarChart } from '@mui/x-charts';
import { categoryBarColor, formatNumber } from './formatters';

export default function ProductsByCategoryBar({ categories, counts }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent >
        <Typography variant="h6" gutterBottom>Products by Category</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            width: '100%',
            height: { xs: 220, sm: 260, md: 300 },
            '& .MuiBarElement-root': { rx: 0 },
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
            xAxis={[{ scaleType: 'band', data: categories }]}
            series={[{ data: counts, label: 'Products' }]}
            yAxis={[{ valueFormatter: formatNumber }]}
            colors={categoryBarColor}
            grid={{ horizontal: true }}
            margin={{ top: 10, right: 10, bottom: 30, left: 50 }}
            height={300}
            borderRadius={10}
            slotProps={{ legend: { direction: 'row' } }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}


