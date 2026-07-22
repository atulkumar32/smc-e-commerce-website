import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Chip, CircularProgress,
  Stack, Divider, Alert, Grid, Paper,
} from '@mui/material';
import ShoppingBagOutlinedIcon   from '@mui/icons-material/ShoppingBagOutlined';
import CurrencyRupeeIcon         from '@mui/icons-material/CurrencyRupee';
import PendingActionsIcon        from '@mui/icons-material/PendingActions';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlinedIcon   from '@mui/icons-material/CheckCircleOutlined';
import ArrowForwardIcon          from '@mui/icons-material/ArrowForward';
import { isUserAuthenticated }   from '../../../services/apiClients';
import {
  fetchDashboardCounts, fetchDashboardRecentOrders, getDashboardCredentials,
} from '../../../Actions/Users/DashboardCountActions';
import StatsCard from '../../../components/StatsCard';

const statusColor = (s = '') => {
  const v = String(s).toLowerCase();
  if (v.includes('deliver') || v.includes('complet')) return 'success';
  if (v.includes('ship')    || v.includes('transit')) return 'primary';
  if (v.includes('cancel')  || v.includes('reject'))  return 'error';
  if (v.includes('pending') || v.includes('process')) return 'warning';
  return 'default';
};
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';
const fmtAmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

function UserDashboard() {
  const navigate = useNavigate();
  const creds    = getDashboardCredentials();

  const [counts,  setCounts]  = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!isUserAuthenticated()) { navigate('/login', { replace: true }); return; }
    (async () => {
      try {
        const [c, o] = await Promise.all([
          fetchDashboardCounts(),
          fetchDashboardRecentOrders({ page: 1, limit: 5 }),
        ]);
        setCounts(c);
        setOrders(Array.isArray(o) ? o : []);
      } catch (err) {
        console.error('[Dashboard]', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const stats = useMemo(() => {
    if (counts) return {
      total:     Number(counts.total_orders  || counts.totalOrders  || 0),
      spent:     Number(counts.total_spent   || counts.totalSpent   || 0),
      pending:   Number(counts.pending       || 0),
      shipped:   Number(counts.shipped       || counts.in_transit   || 0),
      delivered: Number(counts.delivered     || counts.completed    || 0),
    };
    return {
      total:     orders.length,
      spent:     orders.reduce((s, o) => s + Number(o.total_amount || o.total || 0), 0),
      pending:   orders.filter(o => String(o.status||'').toLowerCase().includes('pend')).length,
      shipped:   orders.filter(o => String(o.status||'').toLowerCase().includes('ship')).length,
      delivered: orders.filter(o => String(o.status||'').toLowerCase().includes('deliver')).length,
    };
  }, [counts, orders]);

  const firstName = creds?.name?.split(' ')[0] || 'there';

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3 }, maxWidth: 960, mx: 'auto' }}>
      {/* Greeting */}
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Hello, {firstName} 👋</Typography>
          <Typography variant="body2" color="text.secondary">
            Here's a snapshot of your account.
          </Typography>
        </Box>
        <Button variant="contained" size="small" endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/user/orders')}>
          View All Orders
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stat cards — using shared StatsCard component */}
      <Grid container spacing={2} mb={3}>
        {[
          { icon: <ShoppingBagOutlinedIcon />,   label: 'Total Orders', value: stats.total,
            color: '#1565c0', onClick: () => navigate('/user/orders') },
          { icon: <CurrencyRupeeIcon />,         label: 'Total Spent',  value: fmtAmt(stats.spent),
            color: '#16a34a' },
          { icon: <PendingActionsIcon />,         label: 'Pending',     value: stats.pending,
            color: '#d97706' },
          { icon: <LocalShippingOutlinedIcon />, label: 'Shipped',      value: stats.shipped,
            color: '#0891b2' },
          { icon: <CheckCircleOutlinedIcon />,   label: 'Delivered',    value: stats.delivered,
            color: '#16a34a' },
        ].map((s) => (
          <Grid item xs={6} sm={4} md={2.4} key={s.label}>
            <StatsCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Orders */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider',
        borderRadius: '12px', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: 'grey.50' }}>
          <Typography variant="subtitle1" fontWeight={700}>Recent Orders</Typography>
          <Button size="small" variant="text" onClick={() => navigate('/user/orders')}>
            See all →
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={28} />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="text.secondary">No orders yet.</Typography>
            <Button variant="contained" size="small" sx={{ mt: 1.5 }}
              onClick={() => navigate('/products')}>Start Shopping</Button>
          </Box>
        ) : (
          orders.map((o, i) => (
            <Box key={o.order_id || o.id || i}>
              {i > 0 && <Divider />}
              <Box sx={{ px: 2.5, py: 1.75, display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {o.order_id || `#${o.id}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fmtDate(o.created_at)} · {fmtAmt(o.total_amount || o.total)}
                  </Typography>
                </Box>
                <Chip label={(o.order_status || o.status || 'pending').toUpperCase()}
                  size="small" color={statusColor(o.order_status || o.status)} />
              </Box>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
}

export default UserDashboard;
