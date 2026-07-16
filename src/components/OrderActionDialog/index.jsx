import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, TextField, Box, CircularProgress,
  Alert, Chip, Stack,
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon      from '@mui/icons-material/CancelOutlined';
import { orderStatusAction }   from '../../Actions/OrderStatusAction';

/**
 * OrderActionDialog
 *
 * Reusable approve / reject dialog for orders and shipments.
 *
 * Props:
 *   open         — boolean
 *   onClose      — fn()
 *   onSuccess    — fn(result, actionType) — called after successful API call
 *   actionType   — 'approved' | 'rejected'
 *   row          — the order or shipment row object
 *   idField      — which field to use as order_id (default: 'order_id')
 *   statusField  — which field is the current status (default: 'status')
 *   title        — optional override for dialog title
 */
function OrderActionDialog({
  open,
  onClose,
  onSuccess,
  actionType = 'approved',
  row,
  idField     = 'order_id',
  statusField = 'status',
  source      = 'order',
  title,
}) {
  const [reason,  setReason]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const isApprove = actionType === 'approved';

  useEffect(() => {
    if (open) { setReason(''); setError(''); }
  }, [open]);

  if (!row) return null;

  // ── ID resolution: order_id first, then tracking_id fallback ──────────────
  const orderId = row.order_id || row.tracking_id || row.id;
  const oldStatus = row[statusField] || row.order_status || row.shipment_status || 'pending';
  const displayId = row.order_id || row.tracking_id || row.id || orderId;

  console.group(`🔍 [OrderActionDialog] ID resolution`);
  console.log('row.order_id   :', row.order_id   || '(empty)');
  console.log('row.tracking_id:', row.tracking_id || '(empty)');
  console.log('row.id         :', row.id          || '(empty)');
  console.log('resolved id    :', orderId, '←', row.order_id ? 'order_id' : row.tracking_id ? 'tracking_id' : 'id');
  console.log('old_status     :', oldStatus);
  console.log('action_type    :', actionType);
  console.groupEnd();

  const handleConfirm = async () => {
    if (!isApprove && !reason.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await orderStatusAction({
        orderId,
        actionType,
        reason,
        oldStatus,
        source,
      });
      onSuccess?.(result, actionType);
      onClose();
    } catch (err) {
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dialogTitle = title || (isApprove ? 'Approve Order' : 'Reject Order');
  const confirmLabel = isApprove ? 'Approve' : 'Reject';
  const confirmColor = isApprove ? 'success' : 'error';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {isApprove
            ? <CheckCircleOutlinedIcon color="success" />
            : <CancelOutlinedIcon color="error" />}
          <Box>
            <Typography variant="h6" fontWeight={700} fontSize="1rem">
              {dialogTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {displayId}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {/* Status change preview */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip label={String(oldStatus).toUpperCase()} size="small" variant="outlined" />
          <Typography variant="caption" color="text.secondary">→</Typography>
          <Chip
            label={isApprove ? 'APPROVED' : 'REJECTED'}
            size="small"
            color={confirmColor}
          />
        </Box>

        {/* Confirmation message */}
        <Typography variant="body2" color="text.secondary" mb={isApprove ? 0 : 2}>
          {isApprove
            ? `Are you sure you want to approve order ${displayId}?`
            : `Please provide a reason for rejecting order ${displayId}.`}
        </Typography>

        {/* Reason field — required for reject, optional for approve */}
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          label={isApprove ? 'Reason (optional)' : 'Reason *'}
          placeholder={isApprove
            ? 'e.g. Verified and confirmed'
            : 'e.g. Out of stock - Item damaged'}
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(''); }}
          sx={{ mt: isApprove ? 2 : 0 }}
          error={!!error && !reason.trim()}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={handleConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={15} color="inherit" /> : null}
        >
          {loading ? 'Processing…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OrderActionDialog;
