import { useState, useEffect, useCallback } from 'react';
import { Chip, Typography, Box } from '@mui/material';
import { GetAllOrderDetailsAction } from '../../../Actions/GetAdminOrderDetailsActions';

// ── Status colour map ─────────────────────────────────────────────────────────
export const statusColor = {
  pending:    'warning',
  processing: 'info',
  shipped:    'info',
  delivered:  'success',
  completed:  'success',
  cancelled:  'error',
  failed:     'error',
};

// ── Custom hook ───────────────────────────────────────────────────────────────
export const useOrders = () => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [rawResponse,  setRawResponse]  = useState(null);

  // Pagination — default 10 rows
  const [page,         setPage]         = useState(0);
  const [rowsPerPage,  setRowsPerPage]  = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Summary counts (from API response)
  const [summary, setSummary] = useState({
    total_orders: 0,
    to_accept:    0,
    to_pack:      0,
    in_transit:   0,
    completed:    0,
    upcoming:     0,
  });

  // Filters — includes status for card-click filtering
  const [filters, setFilters] = useState({
    search:    '',
    startDate: '',
    endDate:   '',
    status:    '',
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    setRawResponse(null);

    console.group('📦 [Orders] Fetching');
    console.log('Params:', { page: page + 1, limit: rowsPerPage, ...filters });

    try {
      const response = await GetAllOrderDetailsAction({
        page:      page + 1,
        limit:     rowsPerPage,
        search:    filters.search    || undefined,
        startdate: filters.startDate || undefined,
        enddate:   filters.endDate   || undefined,
        status:    filters.status    || undefined,
      });

      console.log('Response:', response);
      setRawResponse(response);

      if (response?.status === true && response?.data) {
        const d = response.data;
        setOrders(Array.isArray(d.orders) ? d.orders : []);
        setTotalRecords(Number(d.total_records ?? d.orders?.length ?? 0));

        // Only update summary counts when fetching WITHOUT a status filter
        // (so card counts never get wiped by a filtered response)
        if (!filters.status) {
          setSummary({
            total_orders: Number(d.total_orders  || d.total_records || 0),
            to_accept:    Number(d.to_accept     || 0),
            to_pack:      Number(d.to_pack       || 0),
            in_transit:   Number(d.in_transit    || 0),
            completed:    Number(d.completed     || 0),
            upcoming:     Number(d.upcoming      || 0),
          });
        }
      } else if (response?.status === true && Array.isArray(response.data)) {
        setOrders(response.data);
        setTotalRecords(response.data.length);
      } else if (Array.isArray(response)) {
        setOrders(response);
        setTotalRecords(response.length);
      } else {
        setOrders([]);
        setTotalRecords(0);
        setError(response?.message || 'No orders found or unexpected response format');
      }
    } catch (err) {
      console.error('❌ Orders error:', err);
      setError(err.message || 'Error fetching orders');
      setOrders([]);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [page, rowsPerPage, filters]);

  // ── Fetch summary counts once on mount (unfiltered totals) ──────────────────
  const fetchSummary = useCallback(async () => {
    try {
      const res = await GetAllOrderDetailsAction({ page: 1, limit: 1 }); // minimal payload
      if (res?.status === true && res?.data) {
        const d = res.data;
        setSummary({
          total_orders: Number(d.total_orders  || d.total_records || 0),
          to_accept:    Number(d.to_accept     || 0),
          to_pack:      Number(d.to_pack       || 0),
          in_transit:   Number(d.in_transit    || 0),
          completed:    Number(d.completed     || 0),
          upcoming:     Number(d.upcoming      || 0),
        });
      }
    } catch { /* silent — summary is cosmetic */ }
  }, []);

  // On mount: load summary once, then let fetchOrders handle filtered data
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return {
    orders, loading, error, rawResponse,
    page, setPage,
    rowsPerPage, setRowsPerPage,
    totalRecords,
    summary,
    filters, setFilters,
    refetch: fetchOrders,
  };
};

// ── Table columns ─────────────────────────────────────────────────────────────
export const ORDER_COLUMNS = [
  {
    id: 'order_id',
    label: 'Order ID',
    render: (row) => (
      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
        {row.order_id || row.id || '—'}
      </Typography>
    ),
  },
  {
    id: 'customer_name',
    label: 'Customer',
    render: (row) => (
      <Box>
        <Typography variant="body2" fontWeight={500}>{row.customer_name || '—'}</Typography>
        {(row.customer_phone || row.phone) && (
          <Typography variant="caption" color="text.secondary">
            {row.customer_phone || row.phone}
          </Typography>
        )}
      </Box>
    ),
  },
  {
    id: 'payment_method',
    label: 'Payment',
    render: (row) => (
      <Chip label={row.payment_method || '—'} size="small"
        variant="outlined" sx={{ fontSize: '0.7rem' }} />
    ),
  },
  {
    id: 'total_amount',
    label: 'Total',
    render: (row) => (
      <Typography fontWeight={600} color="primary" variant="body2">
        ₹{parseFloat(row.total_amount || 0).toLocaleString('en-IN')}
      </Typography>
    ),
  },
  {
    id: 'status',
    label: 'Order Status',
    render: (row) => {
      const s = (  row.status || 'pending').toLowerCase();
      return <Chip label={s.toUpperCase()} size="small" color={statusColor[s] || 'default'} />;
    },
  },
  {
    id: 'payment_status',
    label: 'Payment Status',
    render: (row) => {
      const s = (row.payment_status || 'pending').toLowerCase();
      return (
        <Chip label={s.toUpperCase()} size="small" variant="outlined"
          color={s === 'completed' || s === 'paid' ? 'success' : 'warning'} />
      );
    },
  },
  {
    id: 'created_at',
    label: 'Date',
    render: (row) => {
      if (!row.created_at) return '—';
      try {
        return new Date(row.created_at).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        });
      } catch { return row.created_at; }
    },
  },
];
