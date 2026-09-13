/**
 * Components/Rating/index.jsx
 *
 * Add / Edit Review modal.
 * Supports create mode (no id) and edit mode (prefilled via `editRow` prop).
 */

import {
  Box, Typography, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField, MenuItem,
  Autocomplete, CircularProgress, Switch, FormControlLabel,
} from '@mui/material';
import CloseIcon       from '@mui/icons-material/Close';
import StarIcon        from '@mui/icons-material/Star';
import { useEffect }   from 'react';

import { useRatingForm, RATING_OPTIONS } from '../../AddRatingData';
import { useProductsForReviews }                         from '../../AddReviewData';

export default function AddReviewModal({ open, onClose, onSaved, editRow = null }) {
  const { products, loading: productsLoading } = useProductsForReviews();
  const { form, set, prefill, errors, saving, handleSave, reset, isEditMode } =
    useRatingForm({ onSuccess: () => { onSaved?.(); onClose(); } });

  // Pre-fill when editRow changes
  useEffect(() => {
    if (open && editRow) prefill(editRow);
    if (open && !editRow) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editRow]);

  const handleClose = () => { reset(); onClose(); };
  const variantOptions = form.product?.variants ?? [];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}>

      {/* ── Header ── */}
      <DialogTitle sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 3, py: 2, borderBottom: '1px solid #e4e7ec', bgcolor: '#fafafa',
      }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="#101828">
            {isEditMode ? 'Edit Review' : 'Add Review & Rating'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isEditMode
              ? 'Update the review details below'
              : 'Manually add a customer review for a product'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}
          sx={{ color: '#667085', '&:hover': { bgcolor: '#f2f4f7' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent sx={{ px: 3, py: 2.5, bgcolor: '#fff' }}>
        <Stack spacing={2.5}>

          {/* 1. Product — read-only in edit mode */}
          {!isEditMode ? (
            <Box>
              <Typography className="arr-field-label">
                Product <span style={{ color: '#dc2626' }}>*</span>
              </Typography>
              <Autocomplete
                size="small"
                options={products}
                loading={productsLoading}
                value={form.product}
                onChange={(_, val) => set('product')(val)}
                getOptionLabel={(o) => `${o.product_id} — ${o.product_name}`}
                isOptionEqualToValue={(a, b) => a.product_id === b.product_id}
                renderOption={(props, option) => {
                  const { key, ...rest } = props;
                  return (
                    <Box component="li" key={key} {...rest}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {option.product_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary"
                          sx={{ fontFamily: 'monospace' }}>
                          {option.product_id}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params}
                    placeholder="Search product by name or ID…"
                    error={!!errors.product} helperText={errors.product}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {productsLoading && <CircularProgress size={14} sx={{ mr: 1 }} />}
                          {params.InputProps?.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Box>
          ) : (
            /* In edit mode show product ID as read-only */
            <Box>
              <Typography className="arr-field-label">Product</Typography>
              <TextField size="small" fullWidth
                value={form.product?.product_id ?? ''}
                disabled
                sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#374151' } }}
              />
            </Box>
          )}

          {/* 2. Variant — shown only in create mode when variants exist */}
          {!isEditMode && form.product && (
            <Box>
              <Typography className="arr-field-label">
                Variant
                <Typography component="span" variant="caption"
                  color="text.secondary" ml={1}>(optional)</Typography>
              </Typography>
              {variantOptions.length === 0 ? (
                <Typography variant="caption" color="text.secondary"
                  sx={{ display: 'block', py: 0.75 }}>
                  No variants available for this product
                </Typography>
              ) : (
                <Autocomplete
                  size="small"
                  options={variantOptions}
                  value={form.variant}
                  onChange={(_, val) => set('variant')(val)}
                  getOptionLabel={(o) => o.variant_id}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  renderOption={(props, option) => {
                    const { key, ...rest } = props;
                    return (
                      <Box component="li" key={key} {...rest}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {option.variant_id}
                        </Typography>
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Search variant ID…" />
                  )}
                />
              )}
            </Box>
          )}

          {/* 3. Rating */}
          <Box>
            <Typography className="arr-field-label">
              Rating <span style={{ color: '#dc2626' }}>*</span>
            </Typography>
            <TextField select size="small" fullWidth
              value={form.rating}
              onChange={(e) => set('rating')(e.target.value)}
              error={!!errors.rating} helperText={errors.rating}>
              <MenuItem value="" disabled>Select rating</MenuItem>
              {RATING_OPTIONS.map((r) => (
                <MenuItem key={r} value={String(r)}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <StarIcon sx={{ fontSize: 15, color: '#f59e0b' }} />
                    <Typography variant="body2" fontWeight={600}>{r.toFixed(1)}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* 4. Review text */}
          <Box>
            <Typography className="arr-field-label">
              Review <span style={{ color: '#dc2626' }}>*</span>
            </Typography>
            <TextField fullWidth multiline rows={3} size="small"
              placeholder="Write a review about this product…"
              value={form.review_text}
              onChange={(e) => set('review_text')(e.target.value)}
              error={!!errors.review_text} helperText={errors.review_text}
            />
          </Box>

          {/* 5. Reviewer name + email */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box flex={1}>
              <Typography className="arr-field-label">
                Reviewer Name <span style={{ color: '#dc2626' }}>*</span>
              </Typography>
              <TextField fullWidth size="small" placeholder="e.g. Rahul Sharma"
                value={form.user_name}
                onChange={(e) => set('user_name')(e.target.value)}
                error={!!errors.user_name} helperText={errors.user_name}
              />
            </Box>
            <Box flex={1}>
              <Typography className="arr-field-label">
                Email
                <Typography component="span" variant="caption"
                  color="text.secondary" ml={1}>(optional)</Typography>
              </Typography>
              <TextField fullWidth size="small" type="email"
                placeholder="e.g. rahul@example.com"
                value={form.user_email}
                onChange={(e) => set('user_email')(e.target.value)}
                error={!!errors.user_email} helperText={errors.user_email}
              />
            </Box>
          </Stack>

          {/* 6. Status toggle — Switch, default Active */}
          <Box>
            <Typography className="arr-field-label" sx={{ mb: 0.5 }}>
              Status
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={form.status === 1}
                  onChange={(e) => set('status')(e.target.checked ? 1 : 0)}
                  slotProps={{ input: { 'aria-label': 'review status' } }}
                  color="success"
                />
              }
              label={
                <Typography variant="body2" fontWeight={600}
                  color={form.status === 1 ? '#16a34a' : '#b91c1c'}>
                  {form.status === 1 ? 'Active' : 'Inactive'}
                </Typography>
              }
            />
          </Box>

        </Stack>
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions sx={{
        px: 3, py: 1.75,
        borderTop: '1px solid #e4e7ec', bgcolor: '#fafafa', gap: 1,
      }}>
        <Button onClick={handleClose} variant="outlined" size="small"
          sx={{ borderColor: '#d0d5dd', color: '#344054', borderRadius: '8px',
            fontWeight: 600, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button variant="contained" size="small"
          onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{
            bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' },
            borderRadius: '8px', fontWeight: 700, textTransform: 'none',
            boxShadow: 'none', px: 2.5,
          }}>
          {saving ? 'Saving…' : isEditMode ? 'Update Review' : 'Save Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
