import { useState } from 'react';
import {
  Box, Typography, Alert, Collapse, IconButton,
  Paper, CircularProgress, Chip, Tooltip, Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TableComponent from '../../../components/TableComponent';
import AdminPagination from '../../../components/Paginations';
import AdminFilters from '../../../components/AdminFilters';
import OrderActionDialog from '../../../components/OrderActionDialog';
import { ORDER_COLUMNS, useOrders, statusColor } from './OrderData';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import MoreVertIcon from '@mui/icons-material/MoreVert';


// import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
// import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

// ── Summary card ──────────────────────────────────────────────────────────────
function SummaryCard({ label, value, color = 'primary', active, onClick }) {
  return (
    <Paper elevation={0} onClick={onClick} sx={{
      p: 2, minWidth: 130, flex: '1 1 130px',
      borderRadius: '10px', cursor: 'pointer',
      border: '1.5px solid',
      borderColor: active ? `${color}.main` : 'divider',
      bgcolor: active ? `${color}.50` : 'background.paper',
      transition: 'all 0.18s',
      '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 },
    }}>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} color={`${color}.main`}>
        {Number(value || 0).toLocaleString('en-IN')}
      </Typography>
    </Paper>
  );
}

// ── Orders Page ───────────────────────────────────────────────────────────────
function OrdersPage() {
  const {
    orders, loading, error, rawResponse,
    page, setPage,
    rowsPerPage, setRowsPerPage,
    totalRecords,
    summary,
    filters, setFilters,
    refetch,
  } = useOrders();

  const [showDebug, setShowDebug] = useState(false);
  const [actionDialog, setActionDialog] = useState({
    open: false, row: null, actionType: 'approved',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleCardClick = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? '' : status,
    }));
    setPage(0);
  };

  const handleSearch = (search, startDate, endDate) => {
    setFilters((prev) => ({ ...prev, search, startDate, endDate }));
    setPage(0);
  };

  const handleActionSuccess = (result, actionType) => {
    showSnack(
      `Order ${actionType === 'approved' ? 'approved' : 'rejected'} successfully`,
      actionType === 'approved' ? 'success' : 'warning'
    );
    refetch();
  };

  const activeStatus = filters.status || '';
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const openMenu = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // ── Table columns + Actions column ───────────────────────────────────────
  const columns = [
    ...ORDER_COLUMNS,
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => {
        const status = ( row.status || '').toLowerCase();
        const isPending = status === 'pending';
        const isApproved = status === 'approved';
        const isShipped = status === 'shipped';
        const isDelivered = status === 'delivered';
        const isCompleted = status === 'completed';

        return (
          <>
            <IconButton size="small" onClick={(e) => openMenu(e, row)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && selectedRow?.id === row.id}
              onClose={closeMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {/* View Details */}
              <MenuItem onClick={() => {
                closeMenu();
                // TODO: Open View Order Details Modal
                console.log('View Details clicked for order:', row.order_id);
              }}>
                <ListItemIcon><VisibilityOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText>👁 View Details</ListItemText>
              </MenuItem>

              {/* Approve Order */}
              <MenuItem
                disabled={!isPending}
                onClick={() => {
                  closeMenu();
                  setActionDialog({ open: true, row, actionType: 'approved' });
                }}
              >
                <ListItemIcon><CheckCircleOutlinedIcon fontSize="small" color="success" /></ListItemIcon>
                <ListItemText>✔ Approve Order</ListItemText>
              </MenuItem>

              {/* Reject Order */}
              <MenuItem
                disabled={!isPending}
                onClick={() => {
                  closeMenu();
                  setActionDialog({ open: true, row, actionType: 'rejected' });
                }}
              >
                <ListItemIcon><CancelOutlinedIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>✖ Reject Order</ListItemText>
              </MenuItem>

              {/* Print Invoice */}
              <MenuItem onClick={() => {
                closeMenu();
                console.log('Print Invoice for:', row.order_id);
                // TODO: Implement print functionality
              }}>
                <ListItemIcon>🖨</ListItemIcon>
                <ListItemText>Print Invoice</ListItemText>
              </MenuItem>

              {/* Mark as Shipped */}
              <MenuItem
                disabled={isShipped || isDelivered || isCompleted}
                onClick={() => {
                  closeMenu();
                  // TODO: Call Mark as Shipped API
                  console.log('Mark as Shipped:', row.order_id);
                }}
              >
                <ListItemIcon>📦</ListItemIcon>
                <ListItemText>Mark as Shipped</ListItemText>
              </MenuItem>

              {/* Mark as Delivered */}
              <MenuItem
                disabled={!isShipped}
                onClick={() => {
                  closeMenu();
                  // TODO: Call Mark as Delivered API
                  console.log('Mark as Delivered:', row.order_id);
                }}
              >
                <ListItemIcon>🚚</ListItemIcon>
                <ListItemText>Mark as Delivered</ListItemText>
              </MenuItem>

              {/* Delete Order */}
              <MenuItem
                onClick={() => {
                  closeMenu();
                  if (window.confirm(`Delete order ${row.order_id}?`)) {
                    // TODO: Call Delete Order API
                    console.log('Delete Order:', row.order_id);
                  }
                }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon><DeleteOutlinedIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>🗑 Delete Order</ListItemText>
              </MenuItem>
            </Menu>
          </>
        );
      },
    }
  ];

  return (
    <Box>
      {/* ── Summary Cards ── */}
      <Stack direction="row" flexWrap="wrap" gap={1.5} mb={3}>
        <SummaryCard label="Total Orders" value={summary.total_orders}
          color="primary" active={activeStatus === ''} onClick={() => handleCardClick('')} />
        <SummaryCard label="To Accept" value={summary.to_accept}
          color="warning" active={activeStatus === 'pending'} onClick={() => handleCardClick('pending')} />
        <SummaryCard label="To Pack" value={summary.to_pack}
          color="info" active={activeStatus === 'processing'} onClick={() => handleCardClick('processing')} />
        <SummaryCard label="In Transit" value={summary.in_transit}
          color="secondary" active={activeStatus === 'shipped'} onClick={() => handleCardClick('shipped')} />
        <SummaryCard label="Completed" value={summary.completed}
          color="success" active={activeStatus === 'completed'} onClick={() => handleCardClick('completed')} />
        <SummaryCard label="Upcoming" value={summary.upcoming}
          color="warning" active={activeStatus === 'upcoming'} onClick={() => handleCardClick('upcoming')} />
      </Stack>

      {/* ── Page header ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1
      }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            View and track all customer orders
            {activeStatus && (
              <Chip label={`Filtered: ${activeStatus}`} size="small"
                color="primary" variant="outlined" sx={{ ml: 1, fontSize: '0.7rem' }}
                onDelete={() => handleCardClick('')} />
            )}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {totalRecords > 0 && (
            <Chip label={`${totalRecords} total`} size="small"
              color="primary" variant="outlined" />
          )}
          <Tooltip title={showDebug ? 'Hide debug' : 'Show debug'}>
            <IconButton size="small" onClick={() => setShowDebug((v) => !v)}
              color={showDebug ? 'warning' : 'default'}>
              <BugReportIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh orders">
            <IconButton size="small" onClick={refetch} disabled={loading} sx={{
              animation: loading ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
            }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Filters ── */}
      <AdminFilters onSearch={handleSearch}
        searchPlaceholder="Search order ID, customer, phone…" showDateFilter />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Debug panel ── */}
      <Collapse in={showDebug}>
        <Paper variant="outlined" sx={{ mb: 2, p: 2, bgcolor: '#0d1117', borderColor: '#30363d', borderRadius: '8px' }}>
          <Typography variant="caption" sx={{
            color: '#58a6ff', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1
          }}>
            🐛 Raw API Response
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
            {[
              ['Status', loading ? '⏳' : error ? '❌' : '✅'],
              ['Rows', String(orders.length)],
              ['Total', String(totalRecords)],
              ['Page', String(page + 1)],
              ['Per Page', String(rowsPerPage)],
              ['Filter', activeStatus || 'all'],
            ].map(([lbl, val]) => (
              <Box key={lbl}>
                <Typography sx={{
                  fontSize: '0.6rem', color: '#8b949e',
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>{lbl}</Typography>
                <Typography sx={{
                  fontSize: '0.72rem', color: '#e6edf3',
                  fontFamily: 'monospace', fontWeight: 600
                }}>{val}</Typography>
              </Box>
            ))}
          </Box>
          {rawResponse && (
            <Box component="pre" sx={{
              fontSize: '0.63rem', color: '#e6edf3',
              bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid #30363d',
              borderRadius: '6px', p: 1.5, m: 0, maxHeight: 280, overflowY: 'auto',
              fontFamily: 'monospace', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {JSON.stringify(rawResponse, null, 2)}
            </Box>
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
          <Typography variant="body2" color="text.disabled">Try adjusting filters.</Typography>
        </Box>
      )}

      {/* ── Table + Pagination ── */}
      {orders.length > 0 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }}>
          <TableComponent
            columns={columns}
            rows={orders}
            page={0}
            rowsPerPage={rowsPerPage}
            totalCount={orders.length}
            getRowId={(row) => row.order_id || row.id}
            emptyMessage="No orders found."
          />
          <AdminPagination
            page={page} totalRecords={totalRecords} rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
          />
        </Paper>
      )}

      {/* ── Approve / Reject Dialog ── */}
      <OrderActionDialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, row: null, actionType: 'approved' })}
        onSuccess={handleActionSuccess}
        actionType={actionDialog.actionType}
        row={actionDialog.row}
        idField="order_id"
        statusField="order_status"
        source="order"
        title={actionDialog.actionType === 'approved' ? 'Approve Order' : 'Reject Order'}
      />

      {/* ── Snackbar ── */}
      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default OrdersPage;
