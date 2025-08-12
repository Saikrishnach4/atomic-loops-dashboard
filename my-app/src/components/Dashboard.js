import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import StatsCards from './dashboard/StatsCards';
import SalesSummaryCards from './dashboard/SalesSummaryCards';
import RevenueTrendArea from './dashboard/RevenueTrendArea';
import SalesByProductBar from './dashboard/SalesByProductBar';
import UsersByGenderPie from './dashboard/UsersByGenderPie';
import ProductsByCategoryBar from './dashboard/ProductsByCategoryBar';
import SalesTable from './dashboard/SalesTable';
import { atomicFetch } from '../utils/atomicFetch';
import { API_BASE } from '../config';
import { useTheme } from '@mui/material/styles';
export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [pages, setPages] = useState([]);
  const [salesRows, setSalesRows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // yyyy-mm-dd or null for overall
  const today = new Date().toISOString().split("T")[0];
  const theme = useTheme();
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [u, p] = await Promise.all([
          atomicFetch(`${API_BASE}/users`),
          atomicFetch(`${API_BASE}/products`),
        ]);

        if (isMounted) {
          setUsers(Array.isArray(u.data) ? u.data : []);
          const productList = Array.isArray(p.data) ? p.data : [];
          setProducts(productList);

          // Aggregate sessions (traffic)
          const trafficMap = new Map();
          for (const prod of productList) {
            const traffic = Array.isArray(prod.traffic) ? prod.traffic : [];
            for (const d of traffic) {
              const key = d.date;
              const current = trafficMap.get(key) || { date: key, organic: 0, referral: 0, paid: 0 };
              current.organic += Number(d.organic || 0);
              current.referral += Number(d.referral || 0);
              current.paid += Number(d.paid || 0);
              trafficMap.set(key, current);
            }
          }
          setSessions(Array.from(trafficMap.values()));

          // Pages data
          const pageRows = productList.map((prod) => ({
            id: prod.id,
            title: prod.name,
            status: prod.status || 'Online',
            users: Number(prod.users || 0),
            eventCount: Number(prod.eventCount || 0),
            viewsPerUser: Number(prod.viewsPerUser || 0),
            avgTimeSec: Number(prod.avgTimeSec || 0),
            dailyConversions: Array.isArray(prod.dailyConversions) ? prod.dailyConversions : [],
          }));
          setPages(pageRows);

          // Sales rows
          const userMap = new Map((Array.isArray(u.data) ? u.data : []).map((usr) => [usr.id, usr.name]));
          const rows = [];
          for (const pdt of productList) {
            const price = Number(pdt.price || 0);
            const sales = Array.isArray(pdt.sales) ? pdt.sales : [];
            for (const s of sales) {
              rows.push({
                id: s.id || `${pdt.id}-${s.userId}-${s.date}`,
                date: s.date,
                productName: pdt.name,
                userName: userMap.get(s.userId) || s.userId,
                quantity: Number(s.quantity || 0),
                price,
                revenue: price * Number(s.quantity || 0),
              });
            }
          }
          setSalesRows(rows);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalUsers = users.length;
  const totalProducts = products.length;
  const maleUsers = useMemo(() => users.filter((u) => u.gender === 'Male').length, [users]);
  const femaleUsers = useMemo(() => users.filter((u) => u.gender === 'Female').length, [users]);

  const activeSessions = useMemo(
    () => (selectedDate ? sessions.filter((d) => d.date === selectedDate) : sessions),
    [sessions, selectedDate]
  );

  const totalSessions = useMemo(
    () => activeSessions.reduce((sum, d) => sum + (Number(d.organic || 0) + Number(d.referral || 0) + Number(d.paid || 0)), 0),
    [activeSessions]
  );

  const percentChange = useMemo(() => {
    if (sessions.length === 0) return 0;
    const windowSize = Math.min(7, sessions.length);
    const firstWindow = sessions.slice(0, windowSize);
    const lastWindow = sessions.slice(-windowSize);
    const sumWindow = (arr) => arr.reduce((s, d) => s + (Number(d.organic || 0) + Number(d.referral || 0) + Number(d.paid || 0)), 0);
    const first = sumWindow(firstWindow);
    const last = sumWindow(lastWindow);
    if (first === 0) return 0;
    return Math.round(((last - first) / first) * 100);
  }, [activeSessions]);

  const usersByGenderData = useMemo(
    () => [
      { id: 0, value: maleUsers, label: 'Male' },
      { id: 1, value: femaleUsers, label: 'Female' },
      { id: 2, value: users.filter((u) => u.gender === 'Other').length, label: 'Other' },
    ],
    [users, maleUsers, femaleUsers]
  );

  const productsByCategory = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const key = p.category || 'Uncategorized';
      map.set(key, (map.get(key) || 0) + 1);
    }
    const categories = Array.from(map.keys());
    const counts = Array.from(map.values());
    return { categories, counts };
  }, [products]);

  const activeProducts = useMemo(() => {
    if (!selectedDate) return products;
    return products.map((p) => ({
      ...p,
      sales: Array.isArray(p.sales) ? p.sales.filter((e) => e.date === selectedDate) : [],
    }));
  }, [products, selectedDate]);

  const salesByProduct = useMemo(() => {
    const names = activeProducts.map((p) => p.name);
    const sold = activeProducts.map((p) => Array.isArray(p.sales) ? p.sales.reduce((s, e) => s + Number(e.quantity || 0), 0) : 0);
    const stock = activeProducts.map((p) => Number(p.quantity || 0));
    return { names, sold, stock };
  }, [activeProducts]);

  const revenueTrend = useMemo(() => {
    const map = new Map();
    for (const p of activeProducts) {
      const price = Number(p.price || 0);
      const sales = Array.isArray(p.sales) ? p.sales : [];
      for (const s of sales) {
        const key = s.date;
        const cur = map.get(key) || { date: key, revenue: 0, units: 0 };
        cur.revenue += price * Number(s.quantity || 0);
        cur.units += Number(s.quantity || 0);
        map.set(key, cur);
      }
    }
    const data = Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
    const total = data.reduce((sum, d) => sum + d.revenue, 0);
    const w = Math.min(7, data.length);
    const first = data.slice(0, w).reduce((s, d) => s + d.revenue, 0);
    const last = data.slice(-w).reduce((s, d) => s + d.revenue, 0);
    const pct = first === 0 ? 0 : Math.round(((last - first) / first) * 100);
    return { data, total, pct };
  }, [activeProducts]);

  const summary = useMemo(() => {
    const totalRevenue = revenueTrend.total;
    const unitsSold = products.reduce((sum, p) => sum + (Array.isArray(p.sales) ? p.sales.reduce((s, e) => s + Number(e.quantity || 0), 0) : 0), 0);
    const lowStockCount = products.filter((p) => Number(p.quantity || 0) <= 10).length;
    const orders = products.reduce((sum, p) => sum + (Array.isArray(p.sales) ? p.sales.length : 0), 0);
    return { totalRevenue, unitsSold, lowStockCount, orders };
  }, [activeProducts, revenueTrend.total]);

  const salesRowsVisible = useMemo(
    () => (selectedDate ? salesRows.filter((r) => r.date === selectedDate) : salesRows),
    [salesRows, selectedDate]
  );

  const availableDates = useMemo(() => {
    const set = new Set([...
      sessions.map((d) => d.date),
    salesRows.map((r) => r.date),
    ]);
    return Array.from(set).filter(Boolean).sort();
  }, [sessions, salesRows]);

  return (
    <Box sx={{ p: 3, bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.paper' : 'transparent'), borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Date"
            type="date"
            size="small"
            value={selectedDate || ''}
            onChange={(e) => setSelectedDate(e.target.value || null)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              max: today,
              style: { colorScheme: theme.palette.mode === 'dark' ? 'white' : 'black' }
            }}
            sx={{
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'invert(0)',
                cursor: 'pointer'
              }
            }}
          />

          <Button
            variant={selectedDate ? 'outlined' : 'contained'}
            onClick={() => setSelectedDate(null)}
          >
            Overall
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flexDirection: "column" }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Overview
              </Typography>
              <StatsCards
                totalUsers={totalUsers}
                totalProducts={totalProducts}
                maleUsers={maleUsers}
                femaleUsers={femaleUsers}
              />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Revenue Overview
              </Typography>
              <SalesSummaryCards
                totalRevenue={summary.totalRevenue}
                unitsSold={summary.unitsSold}
                lowStockCount={summary.lowStockCount}
                orders={summary.orders}
              />
            </div>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Insights
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                flexDirection: { xs: 'column', lg: 'row' },
              }}
            >
              <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: '300px' } }}>
                <RevenueTrendArea
                  dataset={revenueTrend.data}
                  totalRevenue={revenueTrend.total}
                  changePercent={revenueTrend.pct}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: '300px' } }}>
                <SalesByProductBar
                  productNames={salesByProduct.names}
                  unitsSold={salesByProduct.sold}
                  stock={salesByProduct.stock}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Breakdown
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                flexDirection: { xs: 'column', lg: 'row' },
              }}
            >
              <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: '300px' } }}>
                <UsersByGenderPie data={usersByGenderData} />
              </Box>

              <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: '300px' } }}>
                <ProductsByCategoryBar
                  categories={productsByCategory.categories}
                  counts={productsByCategory.counts}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Sales
            </Typography>
            <SalesTable rows={salesRowsVisible} />
          </Box>
        </>
      )}
    </Box>
  );
}
