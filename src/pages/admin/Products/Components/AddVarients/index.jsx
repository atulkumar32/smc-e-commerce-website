/**
 * AddVarients/index.jsx
 *
 * Standalone "Variants" admin page.
 *
 * Layout:
 *   ┌─ Page header  (title + "Add New Variant" button) ───┐
 *   │  Search bar + refresh                               │
 *   │  All-variants table (flattened from GetProducts)    │
 *   │  Add-Variant modal (product dropdown + form)        │
 *   └─────────────────────────────────────────────────────┘
 */

import { useState, useMemo }        from 'react';
import { useSearchParams }           from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Chip,
  Button, IconButton, Tooltip, CircularProgress,
  Alert, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Autocomplete, Table, TableHead, TableRow,
  TableCell, TableBody, Pagination,
} from '@mui/material';
import AddIcon            from '@mui/icons-material/Add';
import RefreshIcon        from '@mui/icons-material/Refresh';
import SearchIcon         from '@mui/icons-material/Search';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloseIcon          from '@mui/icons-material/Close';
import { toast }          from 'react-toastify';

import { useAllVariants, useDeleteVariant } from './AddVarientData';
import AddNewVariant from '../AddNewVarient/index.jsx';

import './index.scss';

// ── Colour dot ────────────────────────────────────────────────────────────────
const Dot = ({ hex }) => (
  <span style={{
    display: 'inline-block', width: 13, height: 13, borderRadius: '50%',
    background: hex || '#ccc', border: '1px solid rgba(0,0,0,0.14)', flexShrink: 0,
  }} />
);

// ── Add-Variant Modal ─────────────────────────────────────────────────────────
function AddVariantModal({ open, onClose, products, onSaved, defaultProductId }) {
  const [selectedProduct, setSelectedProduct] = useState(
    defaultProductId
      ? products.find((p) => p.product_id === defaultProductId) ?? null
      : null
  );

  const handleClose = () => {
    setSelectedProduct(null);
    onClose();
  };

  const handleSuccess = () => {
    toast.success('✅ Variants saved!', { autoClose: 3000 });
    handleClose();
    onSaved();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Sticky header ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 3.5, py: 2.25,
        borderBottom: '1px solid #e4e7ec',
        bgcolor: '#ffffff',
        flexShrink: 0,
        background: 'linear-gradient(135deg, #1a2236 0%, #1565c0 100%)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '10px',
            bgcolor: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AddIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#fff" fontSize="1rem">
              Add New Variants
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
              Select a product → configure colours, sizes, pricing &amp; images
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose}
          sx={{
            color: 'rgba(255,255,255,0.8)',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' },
          }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Product selector strip ── */}
      <Box sx={{
        px: 3.5, py: 2,
        borderBottom: '1px solid #e4e7ec',
        bgcolor: '#f8faff',
        flexShrink: 0,
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}
          spacing={2}>
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="caption" fontWeight={700} color="#374151"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.06em',
                fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
              Select Product <span style={{ color: '#dc2626' }}>*</span>
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Autocomplete
              size="small"
              options={products}
              value={selectedProduct}
              onChange={(_, val) => setSelectedProduct(val)}
              getOptionLabel={(o) => `${o.product_id} — ${o.product_name || o.name || ''}`}
              isOptionEqualToValue={(a, b) => a.product_id === b.product_id}
              filterOptions={(opts, { inputValue }) => {
                const q = inputValue.toLowerCase();
                return opts.filter((o) =>
                  (o.product_name || o.name || '').toLowerCase().includes(q) ||
                  (o.product_id || '').toLowerCase().includes(q)
                );
              }}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <Box component="li" key={key} {...rest} sx={{ py: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: '#1565c0', flexShrink: 0,
                      }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                          {option.product_name || option.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary"
                          sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                          {option.product_id}
                          {option.category_name ? ` · ${option.category_name}` : ''}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search by product name or ID…"
                  sx={{
                    minWidth: 320,
                    '& .MuiInputBase-root': {
                      borderRadius: '8px',
                      bgcolor: '#fff',
                      fontSize: '0.85rem',
                    },
                  }}
                />
              )}
            />
          </Box>

          {/* Selected product pill */}
          {selectedProduct && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 0.75,
              bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: '8px', flexShrink: 0,
            }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: '#16a34a', flexShrink: 0,
              }} />
              <Typography variant="caption" fontWeight={700} color="#1e40af">
                {selectedProduct.product_id}
              </Typography>
              {selectedProduct.category_name && (
                <Typography variant="caption" color="#6b7280">
                  · {selectedProduct.category_name}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </Box>

      {/* ── Scrollable body ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3.5, py: 3, bgcolor: '#f9fafb' }}>
        {selectedProduct ? (
          <Box sx={{
            bgcolor: '#fff',
            border: '1px solid #e4e7ec',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {/* Section label */}
            <Box sx={{
              px: 3, py: 1.5,
              borderBottom: '1px solid #f3f4f6',
              bgcolor: '#f8faff',
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <Box sx={{
                width: 20, height: 20, borderRadius: '50%',
                bgcolor: '#1565c0', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
              }}>
                2
              </Box>
              <Typography variant="caption" fontWeight={700} color="#374151"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                Configure Variants for{' '}
                <Typography component="span" variant="caption"
                  fontWeight={700} color="#1565c0" sx={{ fontSize: 'inherit' }}>
                  {selectedProduct.product_name || selectedProduct.name}
                </Typography>
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <AddNewVariant
                productId={selectedProduct.product_id}
                onSuccess={handleSuccess}
              />
            </Box>
          </Box>
        ) : (
          /* Empty state */
          <Box sx={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            py: 8, gap: 1.5,
            border: '2px dashed #e5e7eb',
            borderRadius: '14px',
            bgcolor: '#fff',
            textAlign: 'center',
          }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '50%',
              bgcolor: '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AddIcon sx={{ color: '#1565c0', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#374151">
                No product selected
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Search and select a product above to start adding variants
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Sticky footer ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: 1.5, px: 3.5, py: 2,
        borderTop: '1px solid #e4e7ec',
        bgcolor: '#fafafa',
        flexShrink: 0,
      }}>
        <Button onClick={handleClose} variant="outlined" size="small"
          sx={{
            borderColor: '#d0d5dd', color: '#344054',
            borderRadius: '8px', fontWeight: 600,
            textTransform: 'none', px: 2.5,
            '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
          }}>
          Close
        </Button>
      </Box>
    </Dialog>
  );
}

const ROWS_PER_PAGE = 10;

// ── Variants table ────────────────────────────────────────────────────────────
function VariantsTable({ variants, loading, error, search, onSearchChange,
  onRefresh, deleting, onDelete }) {

  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return variants;
    const q = search.toLowerCase();
    return variants.filter((v) =>
      (v.variant_id   || '').toLowerCase().includes(q) ||
      (v.product_id   || '').toLowerCase().includes(q) ||
      (v._product_name|| '').toLowerCase().includes(q) ||
      (v.color_name   || '').toLowerCase().includes(q) ||
      (v.size         || '').toLowerCase().includes(q) ||
      (v.sku          || '').toLowerCase().includes(q)
    );
  }, [variants, search]);

  // Reset to page 1 when search changes
  useMemo(() => { setPage(1); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paged      = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const from       = filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const to         = Math.min(page * ROWS_PER_PAGE, filtered.length);

  return (
    <Paper elevation={0} sx={{
      border: '1px solid #e4e7ec', borderRadius: '12px', overflow: 'hidden',
    }}>
      {/* Table toolbar */}
      <Box sx={{
        px: 2.5, py: 1.75,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
        borderBottom: '1px solid #e4e7ec', bgcolor: '#fafafa',
      }}>
        <Typography variant="subtitle2" fontWeight={700} color="#101828">
          All Variants
          {!loading && (
            <Typography component="span" variant="caption" color="text.secondary" ml={1}>
              ({filtered.length}{filtered.length !== variants.length ? ` of ${variants.length}` : ''})
            </Typography>
          )}
        </Typography>
        <Stack direction="row" gap={1} alignItems="center">
          <TextField size="small" placeholder="Search variant, product, colour…"
            value={search} onChange={(e) => onSearchChange(e.target.value)}
            sx={{ width: 260 }}
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

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {/* Error */}
      {!loading && error && (
        <Box sx={{ px: 3, py: 3 }}>
          <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>
        </Box>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <Box sx={{ py: 7, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {search ? `No variants match "${search}".` : 'No variants yet. Click "Add New Variant" to create one.'}
          </Typography>
        </Box>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                {['', '#', 'Variant ID', 'Product', 'Color', 'Size',
                  'MRP', 'Selling', 'Disc%', 'Stock', 'SKU', 'Status', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{
                    fontWeight: 700, fontSize: '0.73rem', color: '#6b7280',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    whiteSpace: 'nowrap', py: 1.25,
                  }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((v, i) => {
                const isActive  = v.status === 1 || v.status === '1' || v.status === 'active';
                const isDeleting = deleting === (v.variant_id || v.id);
                const mrp = Number(v.mrp);
                const sp  = Number(v.selling_price);
                const disc = mrp > 0 && sp > 0
                  ? Math.round((1 - sp / mrp) * 100)
                  : (Number(v.discount_percent) || 0);

                return (
                  <TableRow key={v.variant_id || v.id} hover
                    sx={{ '&:last-child td': { border: 0 } }}>

                    {/* Thumbnail */}
                    <TableCell sx={{ width: 46, px: 1 }}>
                      {v._thumb ? (
                        <Box component="img" src={v._thumb} alt={v.color_name}
                          sx={{ width: 36, height: 36, borderRadius: '6px',
                            objectFit: 'cover', border: '1px solid #e5e7eb', display: 'block' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Box sx={{
                          width: 36, height: 36, borderRadius: '6px',
                          bgcolor: v.color_hex || '#f0f0f0',
                          border: '1px solid #e5e7eb',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '0.55rem', color: '#888',
                        }}>
                          No img
                        </Box>
                      )}
                    </TableCell>

                    {/* # */}
                    <TableCell sx={{ color: '#9ca3af', fontSize: '0.75rem', width: 36 }}>
                      {(page - 1) * ROWS_PER_PAGE + i + 1}
                    </TableCell>

                    {/* Variant ID */}
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem',
                      fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {v.variant_id || v.id || '—'}
                    </TableCell>

                    {/* Product */}
                    <TableCell sx={{ maxWidth: 180 }}>
                      <Typography variant="body2" fontWeight={500} sx={{
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {v._product_name || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary"
                        sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        {v.product_id}
                      </Typography>
                    </TableCell>

                    {/* Color */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        {v.color_hex && <Dot hex={v.color_hex} />}
                        <Typography sx={{ fontSize: '0.75rem' }}>{v.color_name || '—'}</Typography>
                      </Stack>
                    </TableCell>

                    {/* Size */}
                    <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {v.size || '—'}
                    </TableCell>

                    {/* MRP */}
                    <TableCell sx={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {mrp > 0 ? `₹${mrp.toLocaleString('en-IN')}` : '—'}
                    </TableCell>

                    {/* Selling */}
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700,
                      color: '#1565c0', whiteSpace: 'nowrap' }}>
                      {sp > 0 ? `₹${sp.toLocaleString('en-IN')}` : '—'}
                    </TableCell>

                    {/* Disc% */}
                    <TableCell sx={{ fontSize: '0.75rem' }}>
                      {disc > 0
                        ? <Chip label={`${disc}% off`} size="small"
                            sx={{ bgcolor: '#dcfce7', color: '#15803d',
                              fontWeight: 700, fontSize: '0.68rem', border: '1px solid #86efac' }} />
                        : '—'}
                    </TableCell>

                    {/* Stock */}
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {v.stock ?? '—'}
                    </TableCell>

                    {/* SKU */}
                    <TableCell sx={{ fontSize: '0.72rem', fontFamily: 'monospace',
                      color: '#9ca3af' }}>
                      {v.sku || '—'}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={isActive ? 'Active' : 'Inactive'} size="small"
                        color={isActive ? 'success' : 'default'}
                        sx={{ fontSize: '0.65rem' }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Tooltip title="Delete variant">
                        <IconButton size="small" color="error"
                          disabled={isDeleting}
                          onClick={() => onDelete(v)}>
                          {isDeleting
                            ? <CircularProgress size={13} color="error" />
                            : <DeleteOutlinedIcon sx={{ fontSize: 15 }} />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Pagination footer */}
      {!loading && filtered.length > 0 && (
        <Box sx={{
          px: 2.5, py: 1.5,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 1,
          borderTop: '1px solid #e4e7ec', bgcolor: '#fafafa',
        }}>
          <Typography variant="caption" color="text.secondary">
            {filtered.length === 0 ? 'No results'
              : `Showing ${from}–${to} of ${filtered.length} variants`}
          </Typography>
          {totalPages > 1 && (
            <Pagination
              count={totalPages} page={page}
              onChange={(_, p) => setPage(p)}
              size="small" color="primary"
              showFirstButton showLastButton
            />
          )}
        </Box>
      )}
    </Paper>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AddVarientsPage() {
  const [searchParams]  = useSearchParams();
  const defaultPid      = searchParams.get('product_id') ?? '';

  const { products, variants, loading, error, refetch } = useAllVariants();

  const [search,     setSearch]     = useState('');
  const [modalOpen,  setModalOpen]  = useState(Boolean(defaultPid));

  const handleSaved = () => {
    setModalOpen(false);
    refetch();
  };

  const { deleting, handleDelete } = useDeleteVariant(() => {
    toast.success('🗑️ Variant deleted', { autoClose: 2500 });
    refetch();
  });

  return (
    <Box className="av">

      {/* ── Page header ── */}
      <Box className="av__header">
        <Box>
          <Typography variant="h5" fontWeight={700} color="#101828">
            Variants
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.4}>
            All product variants — add, view and manage from here.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{
            bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' },
            borderRadius: '8px', fontWeight: 700,
            textTransform: 'none', px: 2.5, boxShadow: 'none',
          }}>
          Add New Variant
        </Button>
      </Box>

      {/* ── Variants table ── */}
      <VariantsTable
        variants={variants} loading={loading} error={error}
        search={search} onSearchChange={setSearch}
        onRefresh={refetch} deleting={deleting} onDelete={handleDelete}
      />

      {/* ── Add Variant modal ── */}
      <AddVariantModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        products={products}
        onSaved={handleSaved}
        defaultProductId={defaultPid}
      />
    </Box>
  );
}
