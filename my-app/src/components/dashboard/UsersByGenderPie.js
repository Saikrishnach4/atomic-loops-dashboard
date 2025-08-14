import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts';
import { genderPieColors } from './formatters';

export default function UsersByGenderPie({ data }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent  >
        <Typography variant="h6" gutterBottom>Users by Gender</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ width: '100%', height: { sm: 260, md: 300 } }}>
          <PieChart
            series={[{ data, innerRadius: 40, paddingAngle: 2, cornerRadius: 3 }]}
            colors={genderPieColors}
            height={300}
          />
        </Box>
      </CardContent>
    </Card>
  );
}


