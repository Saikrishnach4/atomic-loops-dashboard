import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

function KpiCard({ icon, label, value, gradient }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, background: gradient }}>
      <CardContent sx={{ py: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {icon}
          <Box>
            <Typography variant="overline" color="text.secondary">{label}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{value}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function SalesSummaryCards({ totalRevenue, unitsSold, lowStockCount, orders }) {
  const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          icon={<MonetizationOnIcon color="primary" />}
          label="Total Revenue"
          value={currency.format(Number(totalRevenue || 0))}
          gradient={'linear-gradient(180deg, rgba(46,125,50,0.06), rgba(46,125,50,0))'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          icon={<ShoppingCartIcon color="primary" />}
          label="Units Sold"
          value={Number(unitsSold || 0).toLocaleString()}
          gradient={'linear-gradient(180deg, rgba(25,118,210,0.06), rgba(25,118,210,0))'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          icon={<ReceiptLongIcon color="primary" />}
          label="Orders"
          value={Number(orders || 0).toLocaleString()}
          gradient={'linear-gradient(180deg, rgba(30,136,229,0.06), rgba(30,136,229,0))'}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          icon={<InventoryIcon color="primary" />}
          label="Low Stock Items"
          value={Number(lowStockCount || 0).toLocaleString()}
          gradient={'linear-gradient(180deg, rgba(233,30,99,0.06), rgba(233,30,99,0))'}
        />
      </Grid>
    </Grid>
  );
}


