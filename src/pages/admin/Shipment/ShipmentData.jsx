import { useState, useEffect, useCallback } from 'react';
import { Chip, Typography, Box, Stack, Tooltip, IconButton } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon      from '@mui/icons-material/CancelOutlined';
import { FetchShipmentDetailsAction } from '../../../Actions/FetchShipmentDeatilsActions';

// ── Status colour map ─────────────────────────────────────────────────────────
export const SHIPMENT_STATUS_COLOR = {
  confirmed: 'info',
  packed:    'warning',
  shipped:   'primary',
  delivered: 'success',
  cancelled: 'error',
  pending:   'default',
  returned:  'error',
};

// ── Custom hook ───────────────────────────────────────────────────────────────
export const useShipments = () => {
  const [shipments,    setShipments]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [rawResponse,  setRawResponse]  = useState(null);

  // Pagination — default 10 rows, server-side
  const [page,         setPage]         = useState(0);   // 0-based (UI), sent as page+1 to API
  const [rowsPerPage,  setRowsPerPage]  = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters
  const [filters, setFilters] = useState({ search: '', startDate: '', endDate: '' });

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError('');
    setRawResponse(null);

    console.group('🚚 [Shipments] Fetching');
    console.log('Params:', { page: page + 1, limit: rowsPerPage, ...filters });

    try {
      const response = await FetchShipmentDetailsAction({
        page:      page + 1,
        limit:     rowsPerPage,
        search:    filters.search    || undefined,
        startdate: filters.startDate || undefined,
        enddate:   filters.endDate   || undefined,
      });

      console.log('Response:', response);
      setRawResponse(response);

      if (response?.status === true && Array.isArray(response.data)) {
        setShipments(response.data);
        setTotalRecords(Number(response.total_records ?? response.data.length));
      } else if (Array.isArray(response)) {
        setShipments(response);
        setTotalRecords(response.length);
      } else {
        setShipments([]);
        setTotalRecords(0);
        setError(response?.message || 'No shipments found or unexpected response format');
      }
    } catch (err) {
      console.error('❌ Shipments error:', err);
      setError(err.message || 'Error fetching shipments');
      setShipments([]);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  return {
    shipments, loading, error, rawResponse,
    page, setPage,
    rowsPerPage, setRowsPerPage,
    totalRecords,
    filters, setFilters,
    refetch: fetchShipments,
  };
};

// ── Table columns ─────────────────────────────────────────────────────────────
// onView / onApprove / onReject are injected from the page component
export const buildShipmentColumns = ({ onView, onApprove, onReject }) => [
  {
    id: 'tracking_id',
    label: 'Tracking ID',
    render: (row) => (
      <Typography variant="body2" fontWeight={600}
        sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
        {row.tracking_id || '—'}
      </Typography>
    ),
  },
  {
    id: 'order_id',
    label: 'Order ID',
    render: (row) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
        {row.order_id || '—'}
      </Typography>
    ),
  },
  {
    id: 'customer',
    label: 'Customer',
    render: (row) => (
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {row.customer_name || '—'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.phone || row.customer_phone || '—'}
        </Typography>
      </Box>
    ),
  },
  {
    id: 'address',
    label: 'Destination',
    render: (row) => (
      <Box>
        <Typography variant="body2">{row.city || '—'}, {row.state || '—'}</Typography>
        <Typography variant="caption" color="text.secondary">{row.pincode || ''}</Typography>
      </Box>
    ),
  },
  {
    id: 'shipment_status',
    label: 'Shipment Status',
    render: (row) => {
      const s = (row.shipment_status || 'pending').toLowerCase();
      return (
        <Chip
          label={s.toUpperCase()}
          size="small"
          color={SHIPMENT_STATUS_COLOR[s] || 'default'}
        />
      );
    },
  },
  {
    id: 'cod',
    label: 'COD / Charges',
    render: (row) => (
      <Box>
        {parseFloat(row.cod_amount || 0) > 0 && (
          <Typography variant="body2" fontWeight={600} color="warning.dark">
            COD ₹{parseFloat(row.cod_amount).toLocaleString('en-IN')}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          Shipping ₹{parseFloat(row.shipping_charge || 0).toLocaleString('en-IN')}
        </Typography>
      </Box>
    ),
  },
  {
    id: 'payment_status',
    label: 'Payment',
    render: (row) => {
      if (!row.payment_status) return <Typography variant="caption" color="text.disabled">—</Typography>;
      const s = row.payment_status.toLowerCase();
      return (
        <Chip
          label={s.toUpperCase()}
          size="small"
          variant="outlined"
          color={s === 'completed' || s === 'paid' ? 'success' : 'warning'}
        />
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
  {
    id: 'actions',
    label: 'Actions',
    align: 'right',
    render: (row) => (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        {/* View */}
        <Tooltip title="View details">
          <IconButton size="small" color="info" onClick={() => onView?.(row)}>
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Approve */}
        <Tooltip title="Approve shipment">
          <span>
            <IconButton
              size="small"
              color="success"
              onClick={() => onApprove?.(row)}
              disabled={row.shipment_status === 'delivered' || row.shipment_status === 'cancelled'}
            >
              <CheckCircleOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        {/* Reject / Cancel */}
        <Tooltip title="Reject / Cancel">
          <span>
            <IconButton
              size="small"
              color="error"
              onClick={() => onReject?.(row)}
              disabled={row.shipment_status === 'delivered' || row.shipment_status === 'cancelled'}
            >
              <CancelOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    ),
  },
];
