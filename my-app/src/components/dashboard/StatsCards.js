import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';

export default function StatsCards({ totalUsers, totalProducts, maleUsers, femaleUsers }) {
  const isSmallScreen = useMediaQuery('(max-width:650px)');
  return (
    <Grid container spacing={2} direction={isSmallScreen ? 'column' : 'row'} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ borderRadius: 2, background: 'linear-gradient(180deg, rgba(25,118,210,0.06), rgba(25,118,210,0))' }}>
          <CardContent sx={{ py: 2.5 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <PeopleAltIcon color="primary" />
              <Box>
                <Typography variant="overline" color="text.secondary">Users</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{totalUsers}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ borderRadius: 2, background: 'linear-gradient(180deg, rgba(46,125,50,0.06), rgba(46,125,50,0))' }}>
          <CardContent sx={{ py: 2.5 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Inventory2Icon color="primary" />
              <Box>
                <Typography variant="overline" color="text.secondary">Products</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{totalProducts}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ borderRadius: 2, background: 'linear-gradient(180deg, rgba(30,136,229,0.06), rgba(30,136,229,0))' }}>
          <CardContent sx={{ py: 2.5 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <ManIcon color="primary" />
              <Box>
                <Typography variant="overline" color="text.secondary">Male Users</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{maleUsers}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ borderRadius: 2, background: 'linear-gradient(180deg, rgba(233,30,99,0.06), rgba(233,30,99,0))' }}>
          <CardContent sx={{ py: 2.5 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <WomanIcon color="primary" />
              <Box>
                <Typography variant="overline" color="text.secondary">Female Users</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{femaleUsers}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}


