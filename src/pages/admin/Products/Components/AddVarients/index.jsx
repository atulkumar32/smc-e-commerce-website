/**
 * AddVarients/index.jsx
 *
 * Standalone "Variants" admin page.
 *
 * Layout:
 *   ┌─ Page header  (title + "Add New Variant" button) ───┐
 *   │  Product Filter + Search bar + refresh              │
 *   │  All-variants table (flattened from GetProducts)    │
 *   │  Add-Variant modal (product dropdown + form)        │
 *   └─────────────────────────────────────────────────────┘
 */

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Dialog,
  Autocomplete,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { toast } from 'react-toastify';

import { useAllVariants, useDeleteVariant } from './AddVarientData';
import AddNewVariant from '../AddNewVarient/index.jsx';

import './index.scss';

// ── Colour dot ────────────────────────────────────────────────────────────────
const Dot = ({ hex }) => (
  <span
    style={{
      display: 'inline-block',
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: hex || '#ccc',
      border: '1px solid rgba(0,0,0,0.14)',
      flexShrink: 0,
    }}
  />
);

// ── Click to copy pill ────────────────────────────────────────────────────────
function CopyPill({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text || text === '—') return;
    navigator.clipboard.writeText(String(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <Tooltip title={copied ? 'Copied!' : `${label}: ${text}`} arrow>
      <span
        onClick={handleCopy}
        style={{
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: copied ? '#ecfdf5' : '#f1f5f9',
          color: copied ? '#059669' : '#334155',
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {text}
      </span>
    </Tooltip>
  );
}

// ── Add-Variant Modal ─────────────────────────────────────────────────────────
function AddVariantModal({ open, onClose, products, onSaved, defaultProductId }) {
  const [selectedProduct, setSelectedProduct] = useState(() => {
    if (!defaultProductId || !products.length) return null;
    return (
      products.find(
        (p) =>
          String(p.product_id) === String(defaultProductId) ||
          String(p.id) === String(defaultProductId)
      ) ?? null
    );
  });

  // When products finish loading, auto-select matching defaultProductId if not yet set
  useEffect(() => {
    if (defaultProductId && products.length > 0 && !selectedProduct) {
      const match = products.find(
        (p) =>
          String(p.product_id) === String(defaultProductId) ||
          String(p.id) === String(defaultProductId)
      );
      if (match) setSelectedProduct(match);
    }
  }, [defaultProductId, products, selectedProduct]);

  const handleClose = () => {
    setSelectedProduct(null);
    onClose();
  };

  const handleSuccess = () => {
    toast.success('✅ Variants saved successfully!', { autoClose: 3000 });
    handleClose();
    onSaved();
  };

  const targetPid = selectedProduct?.product_id || selectedProduct?.id || '';

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3.5,
          py: 2.25,
          borderBottom: '1px solid #e4e7ec',
          bgcolor: '#ffffff',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #1e293b 0%, #1565c0 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AddIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#fff" fontSize="1.05rem">
              Add New Product Variant
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Select product → configure color, size, pricing, inventory &amp; images
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            color: 'rgba(255,255,255,0.85)',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Product selector strip ── */}
      <Box
        sx={{
          px: 3.5,
          py: 2,
          borderBottom: '1px solid #e4e7ec',
          bgcolor: '#f8faff',
          flexShrink: 0,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          spacing={2}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="#374151"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.72rem',
                display: 'block',
                mb: 0.5,
              }}
            >
              Select Product <span style={{ color: '#dc2626' }}>*</span>
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Autocomplete
              size="small"
              options={products}
              value={selectedProduct}
              onChange={(_, val) => setSelectedProduct(val)}
              getOptionLabel={(o) =>
                `${o.product_id || o.id} — ${o.product_name || o.name || ''}`
              }
              isOptionEqualToValue={(a, b) =>
                (a.product_id || a.id) === (b.product_id || b.id)
              }
              filterOptions={(opts, { inputValue }) => {
                const q = inputValue.toLowerCase();
                return opts.filter(
                  (o) =>
                    (o.product_name || o.name || '').toLowerCase().includes(q) ||
                    (o.product_id || '').toLowerCase().includes(q)
                );
              }}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <Box component="li" key={key} {...rest} sx={{ py: 1 }}>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#1565c0',
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                          {option.product_name || option.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                        >
                          {option.product_id || option.id}
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
                  placeholder="Search products by name or code…"
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#16a34a',
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" fontWeight={700} color="#1e40af">
                {targetPid}
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
          <Box
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e4e7ec',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            {/* Section label */}
            <Box
              sx={{
                px: 3,
                py: 1.5,
                borderBottom: '1px solid #f3f4f6',
                bgcolor: '#f8faff',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: '#1565c0',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ✓
              </Box>
              <Typography
                variant="caption"
                fontWeight={700}
                color="#374151"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}
              >
                Configuring Variants for{' '}
                <Typography
                  component="span"
                  variant="caption"
                  fontWeight={700}
                  color="#1565c0"
                  sx={{ fontSize: 'inherit' }}
                >
                  {selectedProduct.product_name || selectedProduct.name} ({targetPid})
                </Typography>
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <AddNewVariant productId={targetPid} onSuccess={handleSuccess} onCancel={handleClose} />
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 1.5,
              border: '2px dashed #e5e7eb',
              borderRadius: '14px',
              bgcolor: '#fff',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AddIcon sx={{ color: '#1565c0', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#374151">
                No product selected
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Search and select a product above to start configuring variants
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Sticky footer ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1.5,
          px: 3.5,
          py: 2,
          borderTop: '1px solid #e4e7ec',
          bgcolor: '#fafafa',
          flexShrink: 0,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          size="small"
          sx={{
            borderColor: '#d0d5dd',
            color: '#344054',
            borderRadius: '8px',
            fontWeight: 600,
            textTransform: 'none',
            px: 2.5,
            '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
}

const ROWS_PER_PAGE = 10;

// ── Variants table ────────────────────────────────────────────────────────────
function VariantsTable({
  variants,
  products,
  loading,
  error,
  search,
  onSearchChange,
  productFilter,
  onProductFilterChange,
  onRefresh,
  deleting,
  onDelete,
}) {
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = variants;

    if (productFilter && productFilter !== 'all') {
      list = list.filter(
        (v) =>
          String(v.product_id) === String(productFilter) ||
          String(v._product_name).toLowerCase() === String(productFilter).toLowerCase()
      );
    }

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (v) =>
        (v.variant_id || '').toLowerCase().includes(q) ||
        (v.product_id || '').toLowerCase().includes(q) ||
        (v._product_name || '').toLowerCase().includes(q) ||
        (v.color_name || '').toLowerCase().includes(q) ||
        (v.size || '').toLowerCase().includes(q) ||
        (v.sku || '').toLowerCase().includes(q)
    );
  }, [variants, search, productFilter]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [search, productFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const from = filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const to = Math.min(page * ROWS_PER_PAGE, filtered.length);

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #e4e7ec',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Table toolbar */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          borderBottom: '1px solid #e4e7ec',
          bgcolor: '#fafafa',
        }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="#101828">
            Product Variants Catalog
            {!loading && (
              <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                ({filtered.length}
                {filtered.length !== variants.length ? ` of ${variants.length}` : ''})
              </Typography>
            )}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Filter by Product */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={productFilter}
              onChange={(e) => onProductFilterChange(e.target.value)}
              displayEmpty
              sx={{
                borderRadius: '8px',
                fontSize: '0.82rem',
                bgcolor: '#fff',
                height: 36,
              }}
            >
              <MenuItem value="all">All Products ({variants.length})</MenuItem>
              {products.map((p) => {
                const pid = p.product_id || p.id;
                const name = p.product_name || p.name || pid;
                return (
                  <MenuItem key={pid} value={pid}>
                    {pid} — {name.length > 25 ? name.slice(0, 25) + '…' : name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Search Field */}
          <TextField
            size="small"
            placeholder="Search variant, product, colour…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#9ca3af' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '8px', fontSize: '0.83rem', height: 36, bgcolor: '#fff' },
            }}
          />

          <Tooltip title="Refresh Variants">
            <span>
              <IconButton size="small" onClick={onRefresh} disabled={loading} sx={{ bgcolor: '#fff', border: '1px solid #cbd5e1' }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6, gap: 1.5, alignItems: 'center' }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Loading variants data…
          </Typography>
        </Box>
      )}

      {/* Error */}
      {!loading && error && (
        <Box sx={{ px: 3, py: 3 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={onRefresh}>
                Retry
              </Button>
            }
            sx={{ borderRadius: '8px' }}
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <Box sx={{ py: 7, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '2rem', mb: 1 }}>🎒</Typography>
          <Typography variant="subtitle2" fontWeight={700} color="#334155">
            {search || productFilter !== 'all'
              ? 'No variants match your filter criteria'
              : 'No variants created yet'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {search || productFilter !== 'all'
              ? 'Try changing the product filter or clearing the search box.'
              : 'Click "Add New Variant" above to configure your first variant.'}
          </Typography>
        </Box>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['', '#', 'Variant ID', 'Product', 'Color', 'Size', 'MRP', 'Selling', 'Disc%', 'Stock', 'SKU', 'Status', 'Actions'].map(
                  (h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.73rem',
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                        py: 1.25,
                      }}
                    >
                      {h}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((v, i) => {
                const isActive = v.status === 1 || v.status === '1' || v.status === 'active';
                const isDeleting = deleting === (v.variant_id || v.id);
                const mrp = Number(v.mrp || 0);
                const sp = Number(v.selling_price || 0);
                const disc =
                  mrp > 0 && sp > 0
                    ? Math.round((1 - sp / mrp) * 100)
                    : Number(v.discount_percent) || 0;

                const displayVid = v.variant_id || v.id || '—';
                const displayPid = v.product_id || '—';

                return (
                  <TableRow key={displayVid + i} hover sx={{ '&:last-child td': { border: 0 } }}>
                    {/* Thumbnail */}
                    <TableCell sx={{ width: 46, px: 1 }}>
                      {v._thumb ? (
                        <Box
                          component="img"
                          src={v._thumb}
                          alt={v.color_name || 'Variant'}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid #e2e8f0',
                            display: 'block',
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '6px',
                            bgcolor: v.color_hex || '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.55rem',
                            color: '#94a3b8',
                          }}
                        >
                          {v.color_hex ? '' : 'No img'}
                        </Box>
                      )}
                    </TableCell>

                    {/* # */}
                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.75rem', width: 36 }}>
                      {(page - 1) * ROWS_PER_PAGE + i + 1}
                    </TableCell>

                    {/* Variant ID */}
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <CopyPill text={displayVid} label="Variant ID" />
                    </TableCell>

                    {/* Product */}
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#0f172a',
                        }}
                      >
                        {v._product_name || '—'}
                      </Typography>
                      <CopyPill text={displayPid} label="Product ID" />
                    </TableCell>

                    {/* Color */}
                    <TableCell>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        {v.color_hex && <Dot hex={v.color_hex} />}
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          {v.color_name || '—'}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Size */}
                    <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {v.size || '—'}
                    </TableCell>

                    {/* MRP */}
                    <TableCell sx={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {mrp > 0 ? `₹${mrp.toLocaleString('en-IN')}` : '—'}
                    </TableCell>

                    {/* Selling */}
                    <TableCell
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#1d4ed8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sp > 0 ? `₹${sp.toLocaleString('en-IN')}` : '—'}
                    </TableCell>

                    {/* Disc% */}
                    <TableCell sx={{ fontSize: '0.75rem' }}>
                      {disc > 0 ? (
                        <Chip
                          label={`${disc}% off`}
                          size="small"
                          sx={{
                            bgcolor: '#dcfce7',
                            color: '#15803d',
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            border: '1px solid #86efac',
                            height: 20,
                          }}
                        />
                      ) : (
                        '—'
                      )}
                    </TableCell>

                    {/* Stock */}
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {v.stock ?? 0}
                    </TableCell>

                    {/* SKU */}
                    <TableCell sx={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#64748b' }}>
                      {v.sku || '—'}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={isActive ? 'success' : 'default'}
                        variant={isActive ? 'filled' : 'outlined'}
                        sx={{ fontSize: '0.68rem', height: 20, fontWeight: 600 }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Tooltip title="Delete variant">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={isDeleting}
                            onClick={() => onDelete(v)}
                          >
                            {isDeleting ? (
                              <CircularProgress size={13} color="error" />
                            ) : (
                              <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </span>
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
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            borderTop: '1px solid #e4e7ec',
            bgcolor: '#fafafa',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {filtered.length === 0
              ? 'No results'
              : `Showing ${from}–${to} of ${filtered.length} variants`}
          </Typography>
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              size="small"
              color="primary"
              showFirstButton
              showLastButton
            />
          )}
        </Box>
      )}
    </Paper>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AddVarientsPage() {
  const [searchParams] = useSearchParams();
  const defaultPid = searchParams.get('product_id') ?? '';

  const { products, variants, loading, error, refetch } = useAllVariants();

  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState(defaultPid || 'all');
  const [modalOpen, setModalOpen] = useState(Boolean(defaultPid));

  const inStockCount = useMemo(() => {
    return variants.filter((v) => Number(v.stock || 0) > 0).length;
  }, [variants]);

  // Sync productFilter if defaultPid changes in URL
  useEffect(() => {
    if (defaultPid) {
      setProductFilter(defaultPid);
    }
  }, [defaultPid]);

  const handleSaved = () => {
    setModalOpen(false);
    refetch();
  };

  const { deleting, handleDelete } = useDeleteVariant(() => {
    toast.success('🗑️ Variant deleted', { autoClose: 2500 });
    refetch();
  });

  return (
    <Box className="av" sx={{ p: { xs: 2, sm: 3 } }}>
      {/* ── Page header ── */}
      <Box
        className="av__header"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a">
            Product Variants
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.3}>
            Manage color, size, pricing, inventory and photo variations across all products
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{
            bgcolor: '#1565c0',
            '&:hover': { bgcolor: '#0d47a1' },
            borderRadius: '8px',
            fontWeight: 700,
            textTransform: 'none',
            px: 2.5,
            boxShadow: '0 4px 12px rgba(21, 101, 192, 0.25)',
          }}
        >
          Add New Variant
        </Button>
      </Box>

      {/* ── Summary KPI Stats Bar ── */}
      <Box className="av__stats-bar">
        <Box className="av__stat-pill">
          <Box className="badge-icon" sx={{ bgcolor: '#eff6ff', color: '#2563eb' }}>
            🎒
          </Box>
          <span>Total Variants: <strong>{variants.length}</strong></span>
        </Box>
        <Box className="av__stat-pill">
          <Box className="badge-icon" sx={{ bgcolor: '#f0fdf4', color: '#16a34a' }}>
            📦
          </Box>
          <span>Linked Products: <strong>{products.length}</strong></span>
        </Box>
        <Box className="av__stat-pill">
          <Box className="badge-icon" sx={{ bgcolor: '#ecfdf5', color: '#059669' }}>
            ✓
          </Box>
          <span>In Stock: <strong>{inStockCount}</strong></span>
        </Box>
      </Box>

      {/* ── Variants table ── */}
      <VariantsTable
        variants={variants}
        products={products}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        productFilter={productFilter}
        onProductFilterChange={setProductFilter}
        onRefresh={refetch}
        deleting={deleting}
        onDelete={handleDelete}
      />

      {/* ── Add Variant modal ── */}
      {modalOpen && (
        <AddVariantModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          products={products}
          onSaved={handleSaved}
          defaultProductId={defaultPid}
        />
      )}
    </Box>
  );
}
