import { useState } from 'react';
import {
  Box, Typography, Alert, Collapse, IconButton,
  Paper, CircularProgress, Chip, Tooltip,
} from '@mui/material';
import RefreshIcon   from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import TableComponent   from '../../../components/TableComponent';
import AdminPagination  from '../../../components/Paginations';
import AdminFilters     from '../../../components/AdminFilters';
import { ORDER_COLUMNS, useOrders } from './OrderData';

function OrdersPage() {
  const {
    orders, loading, error, rawResponse,
    page, setPage,
    rowsPerPage, setRowsPerPage,
    totalRecords,
    setFilters,
    refetch,
  } = useOrders();

  const [showDebug, setShowDebug] = useState(false);

  const handleSearch = (search, startDate, endDate) => {
    setFilters({ search, startDate, endDate });
    setPage(0);
  };

  return (
    <Box>
      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            View and track all customer orders
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {totalRecords > 0 && (
            <Chip label={`${totalRecords} total`} size="small"
              color="primary" variant="outlined" />
          )}

          {/* Debug toggle */}
          {/* <Tooltip title={showDebug ? 'Hide debug' : 'Show debug'}>
            <IconButton
              size="small"
              onClick={() => setShowDebug((v) => !v)}
              color={showDebug ? 'warning' : 'default'}
            >
              <BugReportIcon fontSize="small" />
            </IconButton>
          </Tooltip> */}

          {/* Refresh */}
          {/* <Tooltip title="Refresh orders">
            <IconButton
              size="small"
              onClick={refetch}
              disabled={loading}
              sx={{
                animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%':   { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip> */}
        </Box>
      </Box>

      {/* ── Filters ── */}
      <AdminFilters
        onSearch={handleSearch}
        searchPlaceholder="Search order ID, customer, phone…"
        showDateFilter
      />

      {/* ── Error ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* ── Debug panel ── */}
      <Collapse in={showDebug}>
        <Paper variant="outlined" sx={{
          mb: 2, p: 2, bgcolor: '#0d1117', borderColor: '#30363d', borderRadius: '8px',
        }}>
          <Typography variant="caption" sx={{
            color: '#58a6ff', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1,
          }}>
            🐛 Raw API Response
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
            {[
              ['Status',   loading ? '⏳ Loading' : error ? '❌ Error' : '✅ OK'],
              ['Rows',     String(orders.length)],
              ['Total',    String(totalRecords)],
              ['Page',     String(page + 1)],
              ['Per Page', String(rowsPerPage)],
            ].map(([lbl, val]) => (
              <Box key={lbl}>
                <Typography sx={{ fontSize: '0.6rem', color: '#8b949e',
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lbl}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#e6edf3',
                  fontFamily: 'monospace', fontWeight: 600 }}>{val}</Typography>
              </Box>
            ))}
          </Box>

          {rawResponse ? (
            <Box component="pre" sx={{
              fontSize: '0.63rem', color: '#e6edf3',
              bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid #30363d',
              borderRadius: '6px', p: 1.5, m: 0,
              maxHeight: 280, overflowY: 'auto',
              fontFamily: 'monospace', lineHeight: 1.55,
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {JSON.stringify(rawResponse, null, 2)}
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.72rem', color: '#8b949e', fontStyle: 'italic' }}>
              {loading ? 'Waiting…' : 'No response yet.'}
            </Typography>
          )}
        </Paper>
      </Collapse>

      {/* ── Loading ── */}
      {loading && orders.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6, gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">Loading orders…</Typography>
        </Box>
      )}

      {/* ── Empty ── */}
      {!loading && !error && orders.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">No orders found</Typography>
          <Typography variant="body2" color="text.disabled">
            Try adjusting your filters or date range.
          </Typography>
        </Box>
      )}

      {/* ── Table + Pagination ── */}
      {orders.length > 0 && (
        <Paper elevation={0} sx={{
          border: '1px solid', borderColor: 'divider',
          borderRadius: '8px', overflow: 'hidden',
        }}>
          <TableComponent
            columns={ORDER_COLUMNS}
            rows={orders}
            page={0}
            rowsPerPage={rowsPerPage}
            totalCount={orders.length}
            getRowId={(row) => row.order_id || row.id}
            emptyMessage="No orders found."
          />
          <AdminPagination
            page={page}
            totalRecords={totalRecords}
            rowsPerPage={rowsPerPage}
            onPageChange={(p) => setPage(p)}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
          />
        </Paper>
      )}
    </Box>
  );
}

export default OrdersPage;
