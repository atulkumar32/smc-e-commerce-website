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
    accepted:     0,
    to_pack:      0,
    in_transit:   0,
    completed:    0,
    upcoming:     0,
    cancelled:    0,
  });

  // Filters — card for summary card clicks, status for status filter
  const [filters, setFilters] = useState({
    search:    '',
    startDate: '',
    endDate:   '',
    card:      '',    // card param: accepted | upcoming | cancelled | to_pack | in_transit | completed
    status:    '',    // status param: optional separate filter
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page:      page + 1,          // API is 1-indexed
        limit:     rowsPerPage,
        card:      filters.card      || undefined,
        status:    filters.status    || undefined,
        startdate: filters.startDate || undefined,
        enddate:   filters.endDate   || undefined,
        search:    filters.search    || undefined,
      };

      const res = await GetAllOrderDetailsAction(params);
      setRawResponse(res);

      if (res?.status === true && res?.data) {
        const d = res.data;
        setOrders(Array.isArray(d.orders) ? d.orders : []);
        setTotalRecords(Number(d.total_records || 0));

        // Update summary counts from every response (they are always returned)
        setSummary({
          total_orders: Number(d.total_records || 0),
          accepted:     Number(d.accepted      || 0),
          to_pack:      Number(d.to_pack        || 0),
          in_transit:   Number(d.in_transit     || 0),
          completed:    Number(d.completed      || 0),
          upcoming:     Number(d.upcoming       || 0),
          cancelled:    Number(d.cancelled      || 0),
        });
      } else {
        setOrders([]);
        setTotalRecords(0);
        setError(res?.message || 'Unexpected response from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
      setOrders([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

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
