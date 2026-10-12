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
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { toast } from 'react-toastify';

import { TABLE_COLUMNS, REVIEWS_PER_PAGE } from '../../AddReviewData';
import { STATUS_OPTIONS }                   from '../../AddRatingData';
import { deleteReviewAction, updateReviewAction } from '../../../../../Actions/GetProductIdToReviewsActions';
import { isInactive }                    from '../../../../../Actions/ReviewNotificationActions';

// ── Truncate to first N words, show full text on hover ────────────────────────
function TruncatedText({ text, words = 3 }) {
  if (!text) return <Typography variant="caption" color="text.secondary">—</Typography>;
  const parts    = text.trim().split(/\s+/);
  const short    = parts.slice(0, words).join(' ');
  const truncated = parts.length > words;
  if (!truncated) return <Typography variant="body2" color="#374151">{text}</Typography>;
  return (
    <Tooltip title={text} arrow placement="top"
      componentsProps={{ tooltip: { sx: {
        maxWidth: 320, fontSize: '0.78rem',
        bgcolor: '#1A202C', color: '#fff',
        lineHeight: 1.5, p: '8px 12px',
      }}}}>
      <Typography variant="body2" color="#374151"
        sx={{ cursor: 'default', display: 'inline' }}>
        {short}…
      </Typography>
    </Tooltip>
  );
}

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
function StatusChip({ status, isPending }) {
  const s = STATUS_OPTIONS.find((o) => o.value === Number(status))
         ?? STATUS_OPTIONS[0];
  return (
    <Stack direction="row" spacing={0.6} alignItems="center">
      <Chip label={s.label} size="small"
        sx={{
          bgcolor: s.bg, color: s.color, fontWeight: 700,
          fontSize: '0.7rem', border: `1px solid ${s.border}`,
        }} />
      {isPending && (
        <Chip label="New" size="small"
          sx={{
            bgcolor: '#fef3c7', color: '#b45309', fontWeight: 800,
            fontSize: '0.64rem', border: '1px solid #fde68a', height: 20,
          }} />
      )}
    </Stack>
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

  // Status toggle state (for 1-click Active & Revert)
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const handleToggleStatus = async (row, targetStatus) => {
    if (!row?.id) return;
    setUpdatingStatusId(row.id);
    try {
      const updatedRating = Number(row.updated_rating || row.rating || 5);
      const updatedTextReview = (row.updated_text_review || row.review_text || '').trim();

      await updateReviewAction({
        id: row.id,
        status: targetStatus,
        rating: Number(row.rating || updatedRating),
        review_text: (row.review_text || updatedTextReview).trim(),
        updated_rating: updatedRating,
        updated_text_review: updatedTextReview,
        user_name: row.user_name,
        user_email: row.user_email,
      });

      if (targetStatus === 1) {
        toast.success(`✅ Review #${row.id} activated! Now visible on PDP page.`, { autoClose: 3000 });
      } else {
        toast.info(`↩️ Review #${row.id} reverted! Hidden from PDP page.`, { autoClose: 3000 });
      }
      onRefresh();
    } catch (err) {
      toast.error(`❌ ${err.message || 'Status update failed'}`, { autoClose: 4000 });
    } finally {
      setUpdatingStatusId(null);
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
                {reviews.map((row, i) => {
                  const isPending = isInactive(row);
                  return (
                    <tr
                      key={row.id ?? i}
                      style={
                        isPending
                          ? { backgroundColor: 'rgba(254, 243, 199, 0.28)' }
                          : undefined
                      }
                    >
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

                      {/* Updated Rating — only if present */}
                      <td>
                        {row.updated_rating
                          ? <StarBadge value={row.updated_rating} />
                          : <Typography variant="caption" color="text.secondary">—</Typography>}
                      </td>

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

                      {/* Review text — 3 words + tooltip */}
                      <td><TruncatedText text={row.review_text} /></td>

                      {/* Updated review text — 3 words + tooltip */}
                      <td>
                        {row.updated_text_review
                          ? <TruncatedText text={row.updated_text_review} />
                          : <Typography variant="caption" color="text.secondary">—</Typography>}
                      </td>

                      {/* Status */}
                      <td><StatusChip status={row.status} isPending={isPending} /></td>

                      {/* Date */}
                      <td>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#1f2937', fontWeight: 600 }}>
                          {row.created_at
                            ? new Date(row.created_at.replace(' ', 'T')).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : '—'}
                        </Typography>
                        {row.updated_at ? (
                          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.68rem', color: '#16a34a' }}>
                            Updated: {new Date(row.updated_at.replace(' ', 'T')).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.68rem', color: '#9ca3af' }}>
                            Not updated yet
                          </Typography>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <Stack direction="row" spacing={0.6} alignItems="center">
                          {/* Active Button */}
                          <Tooltip
                            title={
                              Number(row.status) === 1
                                ? 'Already Active (Visible on PDP)'
                                : 'Make Active (Show on PDP page)'
                            }
                            arrow
                          >
                            <span>
                              <Button
                                size="small"
                                variant={Number(row.status) === 1 ? 'contained' : 'outlined'}
                                color="success"
                                disabled={Number(row.status) === 1 || updatingStatusId === row.id}
                                onClick={() => handleToggleStatus(row, 1)}
                                startIcon={
                                  updatingStatusId === row.id ? (
                                    <CircularProgress size={12} color="inherit" />
                                  ) : (
                                    <CheckCircleOutlinedIcon sx={{ fontSize: '14px !important' }} />
                                  )
                                }
                                sx={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  py: '3px',
                                  px: '8px',
                                  minWidth: 'auto',
                                  borderRadius: '6px',
                                  textTransform: 'none',
                                  bgcolor: Number(row.status) === 1 ? '#16a34a' : 'transparent',
                                  borderColor: '#16a34a',
                                  color: Number(row.status) === 1 ? '#fff' : '#16a34a',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    bgcolor: Number(row.status) === 1 ? '#15803d' : '#f0fdf4',
                                    borderColor: '#15803d',
                                    boxShadow: 'none',
                                  },
                                  '&.Mui-disabled': {
                                    bgcolor: Number(row.status) === 1 ? '#16a34a' : undefined,
                                    color: Number(row.status) === 1 ? 'rgba(255, 255, 255, 0.95)' : undefined,
                                    borderColor: Number(row.status) === 1 ? 'transparent' : undefined,
                                    opacity: Number(row.status) === 1 ? 0.9 : 0.45,
                                  },
                                }}
                              >
                                Active
                              </Button>
                            </span>
                          </Tooltip>

                          {/* Revert Button (Hide from PDP) */}
                          <Tooltip
                            title={
                              Number(row.status) === 0
                                ? 'Already Reverted (Hidden from PDP)'
                                : 'Revert Review (Hide from PDP page)'
                            }
                            arrow
                          >
                            <span>
                              <Button
                                size="small"
                                variant={Number(row.status) === 0 ? 'contained' : 'outlined'}
                                disabled={Number(row.status) === 0 || updatingStatusId === row.id}
                                onClick={() => handleToggleStatus(row, 0)}
                                startIcon={
                                  updatingStatusId === row.id ? (
                                    <CircularProgress size={12} color="inherit" />
                                  ) : (
                                    <VisibilityOffOutlinedIcon sx={{ fontSize: '14px !important' }} />
                                  )
                                }
                                sx={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  py: '3px',
                                  px: '8px',
                                  minWidth: 'auto',
                                  borderRadius: '6px',
                                  textTransform: 'none',
                                  bgcolor: Number(row.status) === 0 ? '#ea580c' : 'transparent',
                                  borderColor: '#ea580c',
                                  color: Number(row.status) === 0 ? '#fff' : '#ea580c',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    bgcolor: Number(row.status) === 0 ? '#c2410c' : '#fff7ed',
                                    borderColor: '#c2410c',
                                    boxShadow: 'none',
                                  },
                                  '&.Mui-disabled': {
                                    bgcolor: Number(row.status) === 0 ? '#ea580c' : undefined,
                                    color: Number(row.status) === 0 ? 'rgba(255, 255, 255, 0.95)' : undefined,
                                    borderColor: Number(row.status) === 0 ? 'transparent' : undefined,
                                    opacity: Number(row.status) === 0 ? 0.9 : 0.45,
                                  },
                                }}
                              >
                                Revert
                              </Button>
                            </span>
                          </Tooltip>

                          {/* Edit button */}
                          <Tooltip title="Edit Details" arrow>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => onEdit?.(row)}
                              sx={{
                                border: '1px solid #d0d5dd',
                                borderRadius: '6px',
                                p: '4px',
                                '&:hover': { bgcolor: '#f0f9ff', borderColor: '#0284c7' },
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>

                          {/* Delete button */}
                          <Tooltip title="Delete Review" arrow>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteTarget(row)}
                              sx={{
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                p: '4px',
                                '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' },
                              }}
                            >
                              <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </td>
                  </tr>
                  );
                })}
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
