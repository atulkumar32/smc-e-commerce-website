import { useState } from 'react';
import {
  Box, Typography, Alert, Collapse, IconButton,
  Paper, CircularProgress, Chip, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Divider, Grid, Stack,
} from '@mui/material';
import RefreshIcon   from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TableComponent  from '../../../components/TableComponent';
import AdminPagination from '../../../components/Paginations';
import AdminFilters    from '../../../components/AdminFilters';
import { useShipments, buildShipmentColumns, SHIPMENT_STATUS_COLOR } from './ShipmentData';

// ── View detail row ───────────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Grid>
  );
}

// ── View Shipment Modal ───────────────────────────────────────────────────────
function ShipmentViewModal({ shipment: s, open, onClose }) {
  if (!s) return null;
  const status = (s.shipment_status || 'pending').toLowerCase();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <LocalShippingIcon color="primary" />
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700}>Shipment Details</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {s.tracking_id || '—'}
            </Typography>
          </Box>
          <Chip
            label={status.toUpperCase()}
            size="small"
            color={SHIPMENT_STATUS_COLOR[status] || 'default'}
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={1.5}>
          <DetailRow label="Tracking ID"       value={s.tracking_id} />
          <DetailRow label="Order ID"          value={s.order_id} />
          <DetailRow label="Customer Name"     value={s.customer_name} />
          <DetailRow label="Phone"             value={s.phone || s.customer_phone} />
          <DetailRow label="Shipping Address"  value={s.shipping_address} />
          <DetailRow label="City"              value={s.city} />
          <DetailRow label="State"             value={s.state} />
          <DetailRow label="Country"           value={s.country} />
          <DetailRow label="Pincode"           value={s.pincode} />
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={1.5}>
          <DetailRow label="Shipment Status"   value={s.shipment_status} />
          <DetailRow label="Payment Status"    value={s.payment_status} />
          <DetailRow label="Order Status"      value={s.order_status} />
          <DetailRow label="Shipping Charge"   value={s.shipping_charge ? `₹${s.shipping_charge}` : null} />
          <DetailRow label="Charge Status"     value={s.shipping_charge_status} />
          <DetailRow label="COD Amount"        value={s.cod_amount && parseFloat(s.cod_amount) > 0 ? `₹${s.cod_amount}` : null} />
          <DetailRow label="COD Status"        value={s.cod_status} />
          <DetailRow label="Total Amount"      value={s.total_amount ? `₹${s.total_amount}` : null} />
          <DetailRow label="Created At"        value={s.created_at} />
          <DetailRow label="Updated At"        value={s.updated_at} />
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Confirm Dialog (Approve / Reject) ────────────────────────────────────────
function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel, confirmColor }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color={confirmColor || 'primary'} onClick={onConfirm}>
          {confirmLabel || 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Shipment Page ────────────────────────────────────────────────────────
function ShipmentPage() {
  const {
    shipments, loading, error, rawResponse,
    page, setPage,
    rowsPerPage, setRowsPerPage,
    totalRecords,
    setFilters,
    refetch,
  } = useShipments();

  const [showDebug,    setShowDebug]    = useState(false);
  const [viewModal,    setViewModal]    = useState({ open: false, shipment: null });
  const [approveDialog, setApproveDialog] = useState({ open: false, shipment: null });
  const [rejectDialog,  setRejectDialog]  = useState({ open: false, shipment: null });

  // ── Filter handler ────────────────────────────────────────────────────────
  const handleSearch = (search, startDate, endDate) => {
    setFilters({ search, startDate, endDate });
    setPage(0);
  };

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleApproveConfirm = () => {
    if (!approveDialog.shipment) return;
    console.log('✅ Approved:', approveDialog.shipment.tracking_id);
    // TODO: wire to approve API
    setApproveDialog({ open: false, shipment: null });
  };

  const handleRejectConfirm = () => {
    if (!rejectDialog.shipment) return;
    console.log('❌ Rejected:', rejectDialog.shipment.tracking_id);
    // TODO: wire to reject/cancel API
    setRejectDialog({ open: false, shipment: null });
  };

  // ── Build columns with action callbacks ──────────────────────────────────
  const columns = buildShipmentColumns({
    onView:    (row) => setViewModal({ open: true, shipment: row }),
    onApprove: (row) => setApproveDialog({ open: true, shipment: row }),
    onReject:  (row) => setRejectDialog({ open: true, shipment: row }),
  });

  return (
    <Box>
      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Shipments</Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage all shipments
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {totalRecords > 0 && (
            <Chip label={`${totalRecords} total`} size="small"
              color="primary" variant="outlined" />
          )}

          {/* Debug toggle */}
          {/* <Tooltip title={showDebug ? 'Hide debug' : 'Show debug'}>
            <IconButton size="small"
              onClick={() => setShowDebug((v) => !v)}
              color={showDebug ? 'warning' : 'default'}>
              <BugReportIcon fontSize="small" />
            </IconButton>
          </Tooltip> */}

          {/* Refresh */}
          {/* <Tooltip title="Refresh shipments">
            <IconButton size="small" onClick={refetch} disabled={loading}
              sx={{
                animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%':   { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip> */}
        </Box>
      </Box>

      {/* ── Filters ── */}
      <AdminFilters
        onSearch={handleSearch}
        searchPlaceholder="Search tracking ID, order ID, customer, phone…"
        showDateFilter
      />

      {/* ── Error ── */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Debug panel ── */}
      <Collapse in={showDebug}>
        <Paper variant="outlined" sx={{
          mb: 2, p: 2, bgcolor: '#0d1117',
          borderColor: '#30363d', borderRadius: '8px',
        }}>
          <Typography variant="caption" sx={{
            color: '#58a6ff', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            display: 'block', mb: 1,
          }}>
            🐛 Raw API Response
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
            {[
              ['Status',   loading ? '⏳ Loading' : error ? '❌ Error' : '✅ OK'],
              ['Rows',     String(shipments.length)],
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
      {loading && shipments.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6, gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">Loading shipments…</Typography>
        </Box>
      )}

      {/* ── Empty ── */}
      {!loading && !error && shipments.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">No shipments found</Typography>
          <Typography variant="body2" color="text.disabled">
            Try adjusting your filters or date range.
          </Typography>
        </Box>
      )}

      {/* ── Table + Pagination ── */}
      {shipments.length > 0 && (
        <Paper elevation={0} sx={{
          border: '1px solid', borderColor: 'divider',
          borderRadius: '8px', overflow: 'hidden',
        }}>
          <TableComponent
            columns={columns}
            rows={shipments}
            page={0}
            rowsPerPage={rowsPerPage}
            totalCount={shipments.length}
            getRowId={(row) => row.id || row.tracking_id}
            emptyMessage="No shipments found."
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

      {/* ── View Modal ── */}
      <ShipmentViewModal
        shipment={viewModal.shipment}
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, shipment: null })}
      />

      {/* ── Approve Confirm ── */}
      <ConfirmDialog
        open={approveDialog.open}
        onClose={() => setApproveDialog({ open: false, shipment: null })}
        onConfirm={handleApproveConfirm}
        title="Approve Shipment"
        message={`Approve shipment ${approveDialog.shipment?.tracking_id || ''}? This will mark it as confirmed/approved.`}
        confirmLabel="Approve"
        confirmColor="success"
      />

      {/* ── Reject Confirm ── */}
      <ConfirmDialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, shipment: null })}
        onConfirm={handleRejectConfirm}
        title="Reject / Cancel Shipment"
        message={`Cancel shipment ${rejectDialog.shipment?.tracking_id || ''}? This action cannot be undone.`}
        confirmLabel="Cancel Shipment"
        confirmColor="error"
      />
    </Box>
  );
}

export default ShipmentPage;
