import React, { useEffect, useMemo } from 'react';
import { useHookstate } from '@hookstate/core';
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
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TablePagination from '@mui/material/TablePagination';

export default function SalesTable({ rows }) {
  const selectedIds = useHookstate(new Set());
  const dateFilter = useHookstate('all');
  const page = useHookstate(0);
  const rowsPerPage = useHookstate(20);

  useEffect(() => {
    selectedIds.set(new Set());
  }, [rows]);

  const uniqueDates = useMemo(
    () => Array.from(new Set(rows.map((r) => r.date))).sort((a, b) => b.localeCompare(a)),
    [rows]
  );
  const sortedAllRows = useMemo(
    () => rows.slice().sort((a, b) => b.date.localeCompare(a.date)),
    [rows]
  );
  const visibleRows = useMemo(
    () => (dateFilter.get() === 'all' ? sortedAllRows : rows.filter((r) => r.date === dateFilter.get())),
    [rows, dateFilter.get(), sortedAllRows]
  );

  // Reset to first page whenever visible rows or filter changes
  useEffect(() => {
    page.set(0);
  }, [dateFilter.get(), rows.length]);

  const total = visibleRows.length;
  const selectedCount = selectedIds.get().size;
  const allSelected = total > 0 && selectedCount === total;
  const isIndeterminate = selectedCount > 0 && selectedCount < total;

  const toggleAll = () => {
    if (allSelected || isIndeterminate) selectedIds.set(new Set());
    else selectedIds.set(new Set(visibleRows.map((r) => r.id)));
  };

  const toggleRow = (id) => {
    selectedIds.set((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatCurrency = (num) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(num || 0));

  const paginatedRows = useMemo(() => {
    if (rowsPerPage.get() === -1) return visibleRows;
    const start = page.get() * rowsPerPage.get();
    return visibleRows.slice(start, start + rowsPerPage.get());
  }, [visibleRows, page.get(), rowsPerPage.get()]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sales
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="sales-date-filter-label">Filter by Date</InputLabel>
            <Select
              labelId="sales-date-filter-label"
              value={dateFilter.get()}
              label="Filter by Date"
              onChange={(e) => {
                selectedIds.set(new Set());
                dateFilter.set(e.target.value);
              }}
            >
              <MenuItem value="all">All dates</MenuItem>
              {uniqueDates.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              {selectedCount} selected
            </Typography>
          )}
        </Box>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: { xs: 340, sm: 400, md: 440 } }}>
          <Table size="small" stickyHeader>
            <TableHead sx={{ '& th': { fontWeight: 600, color: 'text.secondary', backgroundColor: 'background.paper' } }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox size="small" checked={allSelected} indeterminate={isIndeterminate} onChange={toggleAll} />
                </TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>User</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((r, idx) => {
                const checked = selectedIds.get().has(r.id);
                return (
                  <TableRow
                    key={r.id}
                    hover
                    selected={checked}
                    sx={{ backgroundColor: checked ? 'action.selected' : idx % 2 ? 'action.hover' : 'transparent' }}
                    onClick={() => toggleRow(r.id)}
                    role="checkbox"
                    aria-checked={checked}
                    tabIndex={-1}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox size="small" checked={checked} onChange={() => toggleRow(r.id)} />
                    </TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.productName}</TableCell>
                    <TableCell>{r.userName}</TableCell>
                    <TableCell align="right">{r.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(r.price)}</TableCell>
                    <TableCell align="right">{formatCurrency(r.revenue)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={visibleRows.length}
          page={page.get()}
          onPageChange={(_, newPage) => page.set(newPage)}
          rowsPerPage={rowsPerPage.get()}
          onRowsPerPageChange={(e) => {
            const next = parseInt(e.target.value, 10);
            rowsPerPage.set(Number.isNaN(next) ? 10 : next);
            page.set(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Rows per page:"
        />
      </CardContent>
    </Card>
  );
}


