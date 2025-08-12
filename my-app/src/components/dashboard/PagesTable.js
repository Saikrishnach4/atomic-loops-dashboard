import React, { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { SparkLineChart } from '@mui/x-charts';
import { formatDuration } from './formatters';

export default function PagesTable({ pages }) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Reset selection when data changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [pages]);

  const total = pages.length;
  const selectedCount = selectedIds.size;
  const allSelected = total > 0 && selectedCount === total;
  const isIndeterminate = selectedCount > 0 && selectedCount < total;

  const handleToggleAll = () => {
    if (allSelected || isIndeterminate) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pages.map((p) => p.id)));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Pages</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: { xs: 360, sm: 420, md: 440 } }}>
            <Table size="small" stickyHeader>
              <TableHead sx={{ '& th': { fontWeight: 600, color: 'text.secondary', backgroundColor: 'background.paper' } }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={allSelected} indeterminate={isIndeterminate} onChange={handleToggleAll} />
                  </TableCell>
                  <TableCell>Page Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Users</TableCell>
                  <TableCell align="right">Event Count</TableCell>
                  <TableCell align="right">Views per User</TableCell>
                  <TableCell>Average Time</TableCell>
                  <TableCell>Daily Conversions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pages.map((row, idx) => {
                  const checked = selectedIds.has(row.id);
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      selected={checked}
                      sx={{ backgroundColor: checked ? 'action.selected' : idx % 2 ? 'action.hover' : 'transparent' }}
                      onClick={() => handleToggleRow(row.id)}
                      role="checkbox"
                      aria-checked={checked}
                      tabIndex={-1}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox size="small" checked={checked} onChange={() => handleToggleRow(row.id)} />
                      </TableCell>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>
                        <Chip label={row.status === 'Online' ? 'Online' : 'Offline'} color={row.status === 'Online' ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell align="right">{Number(row.users || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">{Number(row.eventCount || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">{Number(row.viewsPerUser || 0).toFixed(1)}</TableCell>
                      <TableCell>{formatDuration(row.avgTimeSec)}</TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <SparkLineChart data={Array.isArray(row.dailyConversions) ? row.dailyConversions : []} width={160} height={36} curve="linear" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}


