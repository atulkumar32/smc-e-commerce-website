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
import { generateInvoiceAction, readyToDispatchAction } from '../../../Actions/OrderStatusAction';
import StatsCard from '../../../components/StatsCard';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';


// import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
// import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

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

  const handleCardClick = (cardValue) => {
    setFilters((prev) => ({
      ...prev,
      // toggle: clicking the same card again clears filter
      card: prev.card === cardValue ? '' : cardValue,
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
  const activeCard   = filters.card   || '';
  const [anchorEl,    setAnchorEl]    = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  // Track per-order label printed state (required before RTD on to_pack card)
  const [labelPrinted, setLabelPrinted] = useState({});

  const openMenu  = (event, row) => { setAnchorEl(event.currentTarget); setSelectedRow(row); };
  const closeMenu = () => { setAnchorEl(null); setSelectedRow(null); };

  // ── Card config — label, filter value, colour, summary key ───────────────
  const CARD_CONFIG = [
    { label: 'Total Orders', value: '',           color: '#1565c0', icon: '📦', key: 'total_orders' },
    { label: 'Accepted',     value: 'accepted',   color: '#16a34a', icon: '✅', key: 'accepted'     },
    { label: 'To Pack',      value: 'to_pack',    color: '#0891b2', icon: '🗃️', key: 'to_pack'     },
    { label: 'In Transit',   value: 'in_transit', color: '#7c3aed', icon: '🚚', key: 'in_transit'   },
    { label: 'Completed',    value: 'completed',  color: '#059669', icon: '🏁', key: 'completed'    },
    { label: 'Cancelled',    value: 'cancelled',  color: '#dc2626', icon: '❌', key: 'cancelled'    },
  ];

  // ── Table columns + Actions column ───────────────────────────────────────
  const columns = [
    ...ORDER_COLUMNS,
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => {
        const status     = (row.status || '').toLowerCase();
        const isPending  = status === 'pending'  || status === 'confirmed';
        const isApproved = status === 'approved';
        const isRejected = status === 'rejected' || status === 'cancelled';
        const isShipped  = status === 'shipped';
        const isDelivered = status === 'delivered';
        const isCompleted = status === 'completed';
        const alreadyActioned = isApproved || isRejected || isCompleted || isDelivered;
        const hasLabel   = Boolean(labelPrinted[row.order_id || row.id]);

        // Which card context is active decides which actions are visible
        const isAcceptedCard = activeCard === 'accepted' || activeCard === '';
        const isToPackCard   = activeCard === 'to_pack';

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
              {/* ── View Details — always visible ── */}
              <MenuItem onClick={() => {
                closeMenu();
                console.log('View Details:', row.order_id);
              }}>
                <ListItemIcon><VisibilityOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText>👁 View Details</ListItemText>
              </MenuItem>

              {/* ── Accepted card context: Approve & Reject ── */}
              {(activeCard === 'accepted' || activeCard === '') && !alreadyActioned && [
                <MenuItem key="approve"
                  disabled={!isPending}
                  onClick={() => { closeMenu(); setActionDialog({ open: true, row, actionType: 'approved' }); }}>
                  <ListItemIcon><CheckCircleOutlinedIcon fontSize="small" color="success" /></ListItemIcon>
                  <ListItemText>✔ Approve Order</ListItemText>
                </MenuItem>,
                <MenuItem key="reject"
                  disabled={!isPending}
                  onClick={() => { closeMenu(); setActionDialog({ open: true, row, actionType: 'rejected' }); }}>
                  <ListItemIcon><CancelOutlinedIcon fontSize="small" color="error" /></ListItemIcon>
                  <ListItemText> Reject Order</ListItemText>
                </MenuItem>,
              ]}

              {/* ── To Pack card context: Print Label → then RTD ── */}
              {activeCard === 'to_pack' && [
                /* Step 1: Print Label */
                <MenuItem key="print-label"
                  onClick={async () => {
                    closeMenu();
                    try {
                      showSnack('Generating label / invoice…', 'info');
                      const result = await generateInvoiceAction(row.order_id);
                      if (result?.pdf_url) {
                        const link = document.createElement('a');
                        link.href = result.pdf_url;
                        link.target = '_blank';
                        link.download = result.filename || `label_${row.order_id}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        // Mark label as printed for this order
                        setLabelPrinted((prev) => ({ ...prev, [row.order_id || row.id]: true }));
                        showSnack('Label printed — you can now mark Ready to Dispatch', 'success');
                      }
                    } catch (err) {
                      showSnack(err.message || 'Failed to generate label', 'error');
                    }
                  }}>
                  {/* <ListItemIcon>🖨</ListItemIcon> */}
                  <ListItemText>Print Label</ListItemText>
                </MenuItem>,

                /* Step 2: RTD — only enabled after label is printed */
                <MenuItem key="rtd"
                  disabled={!hasLabel}
                  title={!hasLabel ? 'Print label first to enable RTD' : ''}
                  onClick={async () => {
                    closeMenu();
                    try {
                      showSnack('Marking as ready to dispatch…', 'info');
                      await readyToDispatchAction({ order_id: row.order_id, id: row.id, admin_id: '', admin_name: '' });
                      showSnack(`Order ${row.order_id} marked as ready to dispatch`, 'success');
                      refetch();
                    } catch (err) {
                      showSnack(err.message || 'Failed to mark as dispatched', 'error');
                    }
                  }}>
                  <ListItemIcon>📦</ListItemIcon>
                  <ListItemText
                    primary="Ready to Dispatch (RTD)"
                    secondary={!hasLabel ? 'Print label first' : undefined}
                  />
                </MenuItem>,
              ]}

              {/* ── In transit / general: Mark as Delivered ── */}
              {(activeCard === 'in_transit' || activeCard === '') && (
                <MenuItem
                  disabled={!isShipped}
                  onClick={() => { closeMenu(); console.log('Mark as Delivered:', row.order_id); }}>
                  {/* <ListItem Icon>🚚</ListItemIcon> */}
                  <ListItemText>Mark as Delivered</ListItemText>
                </MenuItem>
              )}

              {/* ── Delete — always visible ── */}
              {/* <MenuItem
                sx={{ color: 'error.main' }}
                onClick={() => {
                  closeMenu();
                  if (window.confirm(`Delete order ${row.order_id}?`)) {
                    console.log('Delete Order:', row.order_id);
                  }
                }}>
                <ListItemIcon><DeleteOutlinedIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>🗑 Delete Order</ListItemText>
              </MenuItem> */}
            </Menu>
          </>
        );
      },
    }
  ];

  return (
    <Box>
      {/* ── Summary Cards — active card gets coloured border ── */}
      <Stack direction="row" flexWrap="wrap" gap={1.5} mb={3} useFlexGap
      
      sx={{
        gap:"12px",
      }}
      >
        {CARD_CONFIG.map(({ label, value, color, icon, key }) => {
          const isActive = activeCard === value;
          return (
            <Box key={label} sx={{
              flex: '1 1 140px', minWidth: 130,
              outline: isActive ? `2.5px solid ${color}` : '2.5px solid transparent',
              borderRadius: '14px',
              boxShadow: isActive ? `0 0 0 4px ${color}22` : 'none',
              transition: 'outline 0.15s, box-shadow 0.15s',
            }}>
              <StatsCard
                label={label}
                value={summary[key] ?? 0}
                color={color}
                icon={icon}
                onClick={() => handleCardClick(value)}
              />
            </Box>
          );
        })}
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
