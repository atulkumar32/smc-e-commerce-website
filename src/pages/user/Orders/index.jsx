import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Button, CircularProgress,
  TextField, InputAdornment, Stack, Alert,
  Pagination,
} from '@mui/material';
import SearchIcon      from '@mui/icons-material/Search';
import ArrowBackIcon   from '@mui/icons-material/ArrowBack';
import { isUserAuthenticated } from '../../../services/apiClients';
import { fetchUserOrdersList }  from '../../../Actions/Users/FetchUserOrderAction';

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Order card ────────────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const status     = order.order_status || order.status || 'pending';
  const orderId    = order.order_id     || `#${order.id}`;
  const amount     = order.total_amount || order.total || 0;
  const payMethod  = order.payment_method;
  const payStatus  = order.payment_status;

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider',
      borderRadius: '10px', overflow: 'hidden', mb: 2 }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'grey.50',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
            {orderId}
          </Typography>
          <Chip label={status.toUpperCase()} size="small" color={statusColor(status)} />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {fmtDate(order.created_at)}
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ px: 2.5, py: 1.75 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
          <Box>
            <Typography variant="h6" fontWeight={700} color="primary">
              {fmtAmt(amount)}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
              {payMethod && (
                <Chip label={payMethod} size="small" variant="outlined"
                  sx={{ fontSize: '0.65rem' }} />
              )}
              {payStatus && (
                <Chip
                  label={payStatus.toUpperCase()}
                  size="small"
                  color={payStatus === 'paid' || payStatus === 'completed' ? 'success' : 'warning'}
                  sx={{ fontSize: '0.65rem' }}
                />
              )}
            </Stack>
          </Box>

          {/* Shipping summary */}
          {order.city && (
            <Box sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="body2" color="text.secondary">
                {[order.city, order.state].filter(Boolean).join(', ')}
              </Typography>
              {order.pincode && (
                <Typography variant="caption" color="text.disabled">
                  PIN {order.pincode}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

// ── Orders page ───────────────────────────────────────────────────────────────
function UserOrders() {
  const navigate = useNavigate();
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [page,         setPage]         = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search,       setSearch]       = useState('');
  const LIMIT = 10;

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const { orders: list, total_records } = await fetchUserOrdersList({ page: p, limit: LIMIT });
      setOrders(list);
      setTotalRecords(total_records);
    } catch (err) {
      console.error('[UserOrders]', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isUserAuthenticated()) { navigate('/login', { replace: true }); return; }
    load(1);
  }, [navigate, load]);

  const handlePageChange = (_, p) => { setPage(p); load(p); };

  // Client-side search filter
  const filtered = search.trim()
    ? orders.filter((o) =>
        (o.order_id || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.status   || '').toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const totalPages = Math.ceil(totalRecords / LIMIT);

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3 }, maxWidth: 760, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>My Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            {totalRecords > 0 ? `${totalRecords} order${totalRecords !== 1 ? 's' : ''}` : 'Track your purchases'}
          </Typography>
        </Box>
        <Button size="small" startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/user/dashboard')}>
          Dashboard
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth size="small" placeholder="Search by order ID or status…"
        value={search} onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2.5 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">
            {search ? `No orders match "${search}"` : 'No orders yet.'}
          </Typography>
          {!search && (
            <Button variant="contained" size="small" sx={{ mt: 1.5 }}
              onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          )}
        </Box>
      ) : (
        <>
          {filtered.map((o, i) => <OrderCard key={o.order_id || o.id || i} order={o} />)}

          {totalPages > 1 && !search && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={totalPages} page={page}
                onChange={handlePageChange} color="primary" size="small" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default UserOrders;
