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

  // Filters
  const [filters, setFilters] = useState({ search: '', startDate: '', endDate: '' });

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
      });

      console.log('Response:', response);
      setRawResponse(response);

      // Response shape: { status: true, data: { total_records, orders: [] } }
      if (response?.status === true && response?.data) {
        const d = response.data;
        setOrders(Array.isArray(d.orders) ? d.orders : []);
        setTotalRecords(Number(d.total_records ?? d.orders?.length ?? 0));
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

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return {
    orders, loading, error, rawResponse,
    page, setPage,
    rowsPerPage, setRowsPerPage,
    totalRecords,
    filters, setFilters,
    refetch: fetchOrders,
  };
};

// ── Table columns ─────────────────────────────────────────────────────────────
export const ORDER_COLUMNS = [
  {
    id: 'order_id', label: 'Order ID', minWidth: 150,
    render: (row) => (
      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
        {row.order_id || row.id || '—'}
      </Typography>
    ),
  },
  {
    id: 'customer_name', label: 'Customer',
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
    id: 'payment_method', label: 'Payment',
    render: (row) => (
      <Chip label={row.payment_method || '—'} size="small"
        variant="outlined" sx={{ fontSize: '0.7rem' }} />
    ),
  },
  {
    id: 'total_amount', label: 'Total',
    render: (row) => (
      <Typography fontWeight={600} color="primary" variant="body2">
        ₹{parseFloat(row.total_amount || 0).toLocaleString('en-IN')}
      </Typography>
    ),
  },
  {
    id: 'status', label: 'Order Status',
    render: (row) => {
      const s = (row.order_status || row.status || 'pending').toLowerCase();
      return <Chip label={s.toUpperCase()} size="small" color={statusColor[s] || 'default'} />;
    },
  },
  {
    id: 'payment_status', label: 'Payment Status',
    render: (row) => {
      const s = (row.payment_status || 'pending').toLowerCase();
      return (
        <Chip label={s.toUpperCase()} size="small" variant="outlined"
          color={s === 'completed' || s === 'paid' ? 'success' : 'warning'} />
      );
    },
  },
  {
    id: 'created_at', label: 'Date',
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
