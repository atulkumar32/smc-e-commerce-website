/**
 * Components/Reviews/index.jsx
 *
 * Reviews table — search, pagination, status chip, edit + delete actions.
 */

import { useState } from 'react';
import {
  Box, Typography, Paper, Stack, Chip,
  CircularProgress, Alert, IconButton,
  TextField, InputAdornment, Pagination, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import StarIcon       from '@mui/icons-material/Star';
import SearchIcon     from '@mui/icons-material/Search';
import RefreshIcon    from '@mui/icons-material/Refresh';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EditOutlinedIcon   from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { toast } from 'react-toastify';

import { TABLE_COLUMNS, REVIEWS_PER_PAGE } from '../../AddReviewData';
import { STATUS_OPTIONS }                   from '../../AddRatingData';
import { deleteReviewAction }               from '../../../../../Actions/GetProductIdToReviewsActions';

// ── Star badge ────────────────────────────────────────────────────────────────
function StarBadge({ value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
      <StarIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
      <Typography variant="caption" fontWeight={700} color="#92400e">
        {Number(value || 0).toFixed(1)}
      </Typography>
    </Box>
  );
}

// ── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const s = STATUS_OPTIONS.find((o) => o.value === Number(status))
         ?? STATUS_OPTIONS[0];
  return (
    <Chip label={s.label} size="small"
      sx={{
        bgcolor: s.bg, color: s.color, fontWeight: 700,
        fontSize: '0.7rem', border: `1px solid ${s.border}`,
      }} />
  );
}

// ── Delete confirm dialog ─────────────────────────────────────────────────────
function DeleteConfirm({ open, onClose, onConfirm, deleting }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: '14px' } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Delete Review</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to delete this review? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small"
          sx={{ borderColor: '#d0d5dd', color: '#344054', borderRadius: '8px',
            fontWeight: 600, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button variant="contained" color="error" size="small"
          onClick={onConfirm} disabled={deleting}
          startIcon={deleting ? <CircularProgress size={13} color="inherit" /> : null}
          sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none',
            boxShadow: 'none' }}>
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Reviews table ─────────────────────────────────────────────────────────────
export default function ReviewsTable({
  reviews, loading, error,
  search, onSearchChange,
  page, totalPages, total,
  onPageChange, onRefresh,
  onEdit,                   // (row) => void  — opens edit modal in parent
}) {
  const from = reviews.length === 0 ? 0 : (page - 1) * REVIEWS_PER_PAGE + 1;
  const to   = Math.min(page * REVIEWS_PER_PAGE, total);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null); // row to delete
  const [deleting,     setDeleting]     = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteReviewAction(deleteTarget.id);
      toast.success('🗑️ Review deleted', { autoClose: 2500 });
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      toast.error(`❌ ${err.message || 'Delete failed'}`, { autoClose: 4000 });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Paper elevation={0} sx={{
        border: '1px solid #e4e7ec', borderRadius: '12px', overflow: 'hidden',
      }}>

        {/* ── Header bar ── */}
        <Box sx={{
          px: 2.5, py: 1.75,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
          borderBottom: '1px solid #e4e7ec', bgcolor: '#fafafa',
        }}>
          <Typography variant="subtitle2" fontWeight={700} color="#101828">
            Reviews &amp; Ratings
            {!loading && (
              <Typography component="span" variant="caption"
                color="text.secondary" ml={1}>
                ({total} total)
              </Typography>
            )}
          </Typography>

          <Stack direction="row" gap={1} alignItems="center">
            <TextField size="small" placeholder="Search reviews…"
              value={search} onChange={(e) => onSearchChange(e.target.value)}
              sx={{ width: 220 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#9ca3af' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '8px', fontSize: '0.83rem' },
              }} />
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={onRefresh} disabled={loading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* ── Loading ── */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <Box sx={{ px: 3, py: 3 }}>
            <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>
          </Box>
        )}

        {/* ── Empty ── */}
        {!loading && !error && reviews.length === 0 && (
          <Box sx={{ py: 7, textAlign: 'center' }}>
            <RateReviewIcon sx={{ fontSize: 42, color: '#d1d5db', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {search
                ? `No reviews found for "${search}".`
                : 'No reviews yet. Click "Add Review" to get started.'}
            </Typography>
          </Box>
        )}

        {/* ── Table ── */}
        {!loading && !error && reviews.length > 0 && (
          <Box sx={{ overflowX: 'auto' }}>
            <table className="arr-table">
              <thead>
                <tr>
                  {TABLE_COLUMNS.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map((row, i) => (
                  <tr key={row.id ?? i}>
                    {/* # */}
                    <td className="arr-table__num">
                      {(page - 1) * REVIEWS_PER_PAGE + i + 1}
                    </td>

                    {/* Product ID */}
                    <td>
                      <Typography variant="caption"
                        sx={{ fontFamily: 'monospace', color: '#6b7280' }}>
                        {row.product_id || '—'}
                      </Typography>
                    </td>

                    {/* Product name */}
                    <td>
                      <Typography variant="body2" fontWeight={500} sx={{
                        maxWidth: 160, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {row.product_name || '—'}
                      </Typography>
                    </td>

                    {/* Variant */}
                    <td>
                      {row.variant_id
                        ? <Chip label={row.variant_id} size="small"
                            sx={{ fontFamily: 'monospace', fontSize: '0.7rem',
                              bgcolor: '#f3f4f6', color: '#374151' }} />
                        : <Typography variant="caption" color="text.secondary">—</Typography>}
                    </td>

                    {/* Rating */}
                    <td><StarBadge value={row.rating} /></td>

                    {/* Reviewer */}
                    <td>
                      <Typography variant="body2" fontWeight={500}>
                        {row.user_name || '—'}
                      </Typography>
                      {row.user_email && (
                        <Typography variant="caption" color="text.secondary"
                          sx={{ display: 'block' }}>
                          {row.user_email}
                        </Typography>
                      )}
                    </td>

                    {/* Review text */}
                    <td>
                      <Typography variant="body2" color="#374151" sx={{
                        maxWidth: 220, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {row.review_text || '—'}
                      </Typography>
                    </td>

                    {/* Status */}
                    <td><StatusChip status={row.status} /></td>

                    {/* Date */}
                    {/* <td>
                      <Typography variant="caption" color="text.secondary">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </Typography>
                    </td> */}

                    {/* Actions */}
                    <td>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary"
                            onClick={() => onEdit?.(row)}>
                            <EditOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error"
                            onClick={() => setDeleteTarget(row)}>
                            <DeleteOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}

        {/* ── Pagination footer ── */}
        {!loading && totalPages > 0 && (
          <Box sx={{
            px: 2.5, py: 1.5,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 1,
            borderTop: '1px solid #e4e7ec', bgcolor: '#fafafa',
          }}>
            <Typography variant="caption" color="text.secondary">
              {reviews.length === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}
            </Typography>
            {totalPages > 1 && (
              <Pagination count={totalPages} page={page}
                onChange={(_, p) => onPageChange(p)}
                size="small" color="primary" showFirstButton showLastButton />
            )}
          </Box>
        )}
      </Paper>

      {/* ── Delete confirm dialog ── */}
      <DeleteConfirm
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </>
  );
}
