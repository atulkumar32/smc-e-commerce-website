/**
 * Coupons/index.jsx — Admin Coupons Page
 * Premium card layout with edit modal
 */

import { useState, useEffect }        from 'react';
import {
  Box, Typography, Button, Paper,
  Chip, IconButton, Tooltip, CircularProgress,
  Alert, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
  Switch, FormControlLabel, InputAdornment,
} from '@mui/material';
import AddIcon             from '@mui/icons-material/Add';
import EditOutlinedIcon    from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon  from '@mui/icons-material/DeleteOutlined';
import CloseIcon           from '@mui/icons-material/Close';
import LocalOfferIcon      from '@mui/icons-material/LocalOffer';
import SearchIcon          from '@mui/icons-material/Search';
import RefreshIcon         from '@mui/icons-material/Refresh';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import EventOutlinedIcon     from '@mui/icons-material/EventOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import VerifiedOutlinedIcon  from '@mui/icons-material/VerifiedOutlined';

import {
  useCouponsList,
  useCouponForm,
  useProductsAndUsers,
  PERCENT_OPTIONS,
} from './CouponsData';
import CustomSelect from '../../../components/CustomSelect';
import './index.scss';

// ── Helpers ───────────────────────────────────────────────────
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : 'No expiry';

const isExpired = (d) => d && new Date(d) < new Date();

// ── Coupon Modal (Add + Edit) ─────────────────────────────────
function CouponModal({ open, onClose, editRow, onSaved }) {
  const { products, users } = useProductsAndUsers(open);
  const {
    form, set, prefill, errors, saving, handleSave, reset, isEdit,
    toggleProduct, toggleUser,
  } = useCouponForm({ onSuccess: () => { onSaved(); onClose(); } });

  // Prefill / reset when dialog opens
  useEffect(() => {
    if (!open) return;
    if (editRow) prefill(editRow);
    else reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editRow]);

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>

      {/* Gradient header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a2236 0%, #1565c0 100%)',
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '10px',
            bgcolor: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalOfferIcon sx={{ color: '#fbbf24', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="#fff">
              {isEdit ? 'Edit Coupon' : 'Add New Coupon'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {isEdit ? 'Update coupon details' : 'Create a discount coupon'}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose}
          sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5, bgcolor: '#f8fafc' }}>
        <Stack spacing={2.25}>

          {/* Code + Discount % — side by side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <label className="cp-fl">Coupon Code <span style={{ color: '#dc2626' }}>*</span></label>
              <TextField size="small" fullWidth
                placeholder="e.g. SAVE20"
                value={form.coupon_code}
                onChange={e => set('coupon_code')(e.target.value.toUpperCase())}
                error={!!errors.coupon_code}
                helperText={errors.coupon_code}
                inputProps={{ style: { fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700, fontSize: 14 } }}
                sx={{ bgcolor: '#fff', '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Box>
            <Box>
              <CustomSelect
                label="Discount % *"
                placeholder="Select %"
                options={PERCENT_OPTIONS}
                value={form.discount_percent}
                onChange={val => set('discount_percent')(val)}
                error={errors.discount_percent}
              />
            </Box>
          </Box>

          {/* Min order + Max uses */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <label className="cp-fl">Min Order (₹)</label>
              <TextField size="small" fullWidth type="number"
                placeholder="0"
                value={form.min_order_amount}
                onChange={e => set('min_order_amount')(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                sx={{ bgcolor: '#fff', '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Box>
            <Box>
              <label className="cp-fl">Max Uses</label>
              <TextField size="small" fullWidth type="number"
                placeholder="Unlimited"
                value={form.max_uses}
                onChange={e => set('max_uses')(e.target.value)}
                sx={{ bgcolor: '#fff', '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Box>
          </Box>

          {/* Expiry date */}
          <Box>
            <label className="cp-fl">Expiry Date</label>
            <TextField size="small" fullWidth type="date"
              value={form.expiry_date}
              onChange={e => set('expiry_date')(e.target.value)}
              error={!!errors.expiry_date}
              helperText={errors.expiry_date || 'Leave empty for no expiry'}
              sx={{ bgcolor: '#fff', '& .MuiInputBase-root': { borderRadius: '10px' } }}
            />
          </Box>

          {/* Products */}
          {products.length > 0 && (
            <Box>
              <label className="cp-fl">Applicable Products</label>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Leave empty to apply to all products
              </Typography>
              <Box sx={{
                maxHeight: 150, overflowY: 'auto',
                border: '1.5px solid #e5e7eb', borderRadius: '10px',
                bgcolor: '#fff', p: '6px',
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { background: '#e5e7eb', borderRadius: 2 },
              }}>
                {products.map(p => {
                  const pid      = p.id || p.product_id;
                  const selected = form.product_ids.includes(pid);
                  return (
                    <Box key={pid} component="label" sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      px: 1.25, py: 0.75, borderRadius: '7px', cursor: 'pointer',
                      bgcolor: selected ? '#eff6ff' : 'transparent',
                      '&:hover': { bgcolor: selected ? '#eff6ff' : '#f9fafb' },
                    }}>
                      <input type="checkbox" checked={selected}
                        onChange={() => toggleProduct(pid)}
                        style={{ accentColor: '#1565c0', width: 14, height: 14, flexShrink: 0 }} />
                      <Typography variant="caption" color="#374151" fontWeight={selected ? 600 : 400}>
                        {p.product_name || p.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#9ca3af', ml: 'auto' }}>
                        {pid}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              {form.product_ids.length > 0 && (
                <Typography variant="caption" color="#1565c0" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
                  ✓ {form.product_ids.length} product(s) selected
                </Typography>
              )}
            </Box>
          )}

          {/* Users */}
          {users.length > 0 && (
            <Box>
              <label className="cp-fl">Applicable Users</label>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Leave empty to apply to all users
              </Typography>
              <Box sx={{
                maxHeight: 150, overflowY: 'auto',
                border: '1.5px solid #e5e7eb', borderRadius: '10px',
                bgcolor: '#fff', p: '6px',
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { background: '#e5e7eb', borderRadius: 2 },
              }}>
                {users.map(u => {
                  const selected = form.user_ids.includes(u.id);
                  return (
                    <Box key={u.id} component="label" sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      px: 1.25, py: 0.75, borderRadius: '7px', cursor: 'pointer',
                      bgcolor: selected ? '#eff6ff' : 'transparent',
                      '&:hover': { bgcolor: selected ? '#eff6ff' : '#f9fafb' },
                    }}>
                      <input type="checkbox" checked={selected}
                        onChange={() => toggleUser(u)}
                        style={{ accentColor: '#1565c0', width: 14, height: 14, flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="#374151" fontWeight={selected ? 600 : 400}
                          sx={{ display: 'block' }}>
                          {u.full_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.67rem' }}>
                          {u.email}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              {form.user_ids.length > 0 && (
                <Typography variant="caption" color="#1565c0" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
                  ✓ {form.user_ids.length} user(s) selected
                </Typography>
              )}
            </Box>
          )}

          {/* Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2, py: 1.25, bgcolor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px' }}>
            <Box>
              <Typography variant="body2" fontWeight={700} color="#111827">Coupon Status</Typography>
              <Typography variant="caption" color="text.secondary">
                {form.is_active === 1 ? 'Active — customers can use this coupon' : 'Inactive — coupon is disabled'}
              </Typography>
            </Box>
            <Switch
              checked={form.is_active === 1}
              onChange={e => set('is_active')(e.target.checked ? 1 : 0)}
              color="success"
              slotProps={{ input: { 'aria-label': 'coupon status' } }}
            />
          </Box>

        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e4e7ec', bgcolor: '#fff', gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" size="small"
          sx={{ borderColor: '#d0d5dd', color: '#344054', borderRadius: '10px',
            fontWeight: 600, textTransform: 'none', px: 2.5 }}>
          Cancel
        </Button>
        <Button variant="contained" size="small"
          onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <LocalOfferIcon />}
          sx={{
            background: 'linear-gradient(135deg,#1a2236,#1565c0)',
            borderRadius: '10px', fontWeight: 700, textTransform: 'none',
            boxShadow: '0 4px 14px rgba(21,101,192,.3)', px: 2.5,
            '&:hover': { background: 'linear-gradient(135deg,#111827,#0d47a1)' },
          }}>
          {saving ? 'Saving…' : isEdit ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Coupon Card ───────────────────────────────────────────────
function CouponCard({ coupon, onEdit, onDelete }) {
  const code    = coupon.coupon_code || coupon.code || '—';
  const pct     = coupon.discount_percent ?? '?';
  const active  = Number(coupon.is_active ?? coupon.status) === 1;
  const expired = isExpired(coupon.expiry_date);

  return (
    <div className="cp__card">
      {/* Top gradient section */}
      <div className="cp__card-top">
        <div>
          <div className="cp__card-code">{code}</div>
        </div>
        <div className="cp__card-discount">
          {pct}%
          <span>discount</span>
        </div>
      </div>

      {/* Body */}
      <div className="cp__card-body">
        <div className="cp__card-meta">
          <div className="cp__card-meta-item">
            <label>Min Order</label>
            <span>{coupon.min_order_amount ? `₹${Number(coupon.min_order_amount).toLocaleString('en-IN')}` : 'No min'}</span>
          </div>
          <div className="cp__card-meta-item">
            <label>Max Uses</label>
            <span>{coupon.max_uses || 'Unlimited'}</span>
          </div>
          <div className="cp__card-meta-item">
            <label>Expires</label>
            <span style={{ color: expired ? '#dc2626' : 'inherit' }}>
              {fmtDate(coupon.expiry_date)}
            </span>
          </div>
          <div className="cp__card-meta-item">
            <label>Redemptions</label>
            <span>{coupon.used_count ?? coupon.redemptions ?? 0}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="cp__card-tags">
          {Array.isArray(coupon.product_ids) && coupon.product_ids.length > 0 && (
            <Chip icon={<InventoryOutlinedIcon />} label={`${coupon.product_ids.length} products`} size="small"
              sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontSize: '0.7rem', fontWeight: 600,
                border: '1px solid #bfdbfe', '& .MuiChip-icon': { fontSize: 13 } }} />
          )}
          {Array.isArray(coupon.user_ids) && coupon.user_ids.length > 0 && (
            <Chip icon={<PeopleAltOutlinedIcon />} label={`${coupon.user_ids.length} users`} size="small"
              sx={{ bgcolor: '#fdf4ff', color: '#7e22ce', fontSize: '0.7rem', fontWeight: 600,
                border: '1px solid #e9d5ff', '& .MuiChip-icon': { fontSize: 13 } }} />
          )}
          {(!Array.isArray(coupon.product_ids) || coupon.product_ids.length === 0) &&
           (!Array.isArray(coupon.user_ids)    || coupon.user_ids.length === 0) && (
            <Chip icon={<VerifiedOutlinedIcon />} label="All customers" size="small"
              sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem', fontWeight: 600,
                border: '1px solid #bbf7d0', '& .MuiChip-icon': { fontSize: 13 } }} />
          )}
          {expired && (
            <Chip label="Expired" size="small"
              sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 700,
                border: '1px solid #fecaca' }} />
          )}
        </div>

        {/* Footer */}
        <div className="cp__card-footer">
          <Chip
            label={active && !expired ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              bgcolor: active && !expired ? '#dcfce7' : '#f3f4f6',
              color:   active && !expired ? '#15803d' : '#6b7280',
              fontWeight: 700, fontSize: '0.7rem',
              border: `1px solid ${active && !expired ? '#86efac' : '#e5e7eb'}`,
            }}
          />
          <div className="cp__card-actions">
            <Tooltip title="Edit coupon">
              <IconButton size="small" onClick={() => onEdit(coupon)}
                sx={{ bgcolor: '#eff6ff', color: '#1565c0', borderRadius: '8px',
                  '&:hover': { bgcolor: '#dbeafe' } }}>
                <EditOutlinedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete coupon">
              <IconButton size="small" onClick={() => onDelete(coupon.id)}
                sx={{ bgcolor: '#fef2f2', color: '#dc2626', borderRadius: '8px',
                  '&:hover': { bgcolor: '#fee2e2' } }}>
                <DeleteOutlinedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function CouponsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow,   setEditRow]   = useState(null);

  const {
    coupons, summary, loading, error,
    search, setSearch,
    startDate, setStartDate,
    endDate, setEndDate,
    refetch, remove,
  } = useCouponsList();

  const openAdd  = ()    => { setEditRow(null); setModalOpen(true); };
  const openEdit = (row) => { setEditRow(row);  setModalOpen(true); };

  // Stat config
  const stats = [
    { label: 'Total Coupons',     value: summary?.total_coupons     ?? 0, color: '#1565c0', bg: '#eff6ff', border: '#bfdbfe', icon: <LocalOfferIcon /> },
    { label: 'Active',            value: summary?.active_coupons    ?? 0, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: <VerifiedOutlinedIcon /> },
    { label: 'Inactive',          value: summary?.inactive_coupons  ?? 0, color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', icon: <LocalOfferIcon /> },
    { label: 'Total Redemptions', value: summary?.total_redemptions ?? 0, color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <ShoppingCartOutlinedIcon /> },
  ];

  return (
    <Box className="cp">

      {/* ── Header ── */}
      <Box className="cp__header">
        <Box>
          <Typography variant="h5" fontWeight={800} color="#101828">
            Coupon Management
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.4}>
            Create and manage discount coupons for customers.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{
            background: 'linear-gradient(135deg,#1a2236,#1565c0)',
            borderRadius: '10px', fontWeight: 700, textTransform: 'none',
            px: 2.5, boxShadow: '0 4px 14px rgba(21,101,192,.3)',
            '&:hover': { background: 'linear-gradient(135deg,#111827,#0d47a1)' },
          }}
        >
          Add New Coupon
        </Button>
      </Box>

      {/* ── Stats ── */}
      <Box className="cp__stats">
        {stats.map(s => (
          <Paper key={s.label} elevation={0}
            className="cp__stat"
            sx={{ bgcolor: s.bg, border: `1px solid ${s.border}` }}>
            <Box className="cp__stat-icon"
              sx={{ bgcolor: `${s.color}18`, color: s.color }}>
              {s.icon}
            </Box>
            <Box>
              <div className="cp__stat-val" style={{ color: s.color }}>{s.value}</div>
              <div className="cp__stat-lbl">{s.label}</div>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* ── Filters ── */}
      <Box className="cp__filters">
        <TextField
          size="small"
          placeholder="Search coupon code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="cp__filter-search"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#9ca3af' }} /></InputAdornment>,
            sx: { borderRadius: '10px', bgcolor: '#fff' },
          }}
        />
        <TextField size="small" type="date" label="From"
          value={startDate} onChange={e => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150, '& .MuiInputBase-root': { borderRadius: '10px', bgcolor: '#fff' } }} />
        <TextField size="small" type="date" label="To"
          value={endDate} onChange={e => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150, '& .MuiInputBase-root': { borderRadius: '10px', bgcolor: '#fff' } }} />
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={() => refetch()} disabled={loading}
            sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {!loading && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
            {coupons.length} coupon{coupons.length !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

      {/* ── Grid ── */}
      {loading ? (
        <Box className="cp__grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="cp__skeleton" />
          ))}
        </Box>
      ) : coupons.length === 0 ? (
        <Box className="cp__empty">
          <LocalOfferIcon sx={{ fontSize: 52, color: '#d1d5db', mb: 1.5 }} />
          <Typography variant="h6" fontWeight={700} color="#374151" mb={0.5}>
            No coupons yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            Create your first discount coupon to attract customers.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
            sx={{ background: 'linear-gradient(135deg,#1a2236,#1565c0)', borderRadius: '10px',
              fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}>
            Add New Coupon
          </Button>
        </Box>
      ) : (
        <Box className="cp__grid">
          {coupons.map((c, i) => (
            <CouponCard key={c.id ?? i} coupon={c} onEdit={openEdit} onDelete={remove} />
          ))}
        </Box>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <CouponModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editRow={editRow}
          onSaved={refetch}
        />
      )}
    </Box>
  );
}
