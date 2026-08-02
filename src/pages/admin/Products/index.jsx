import { useState, useMemo, useCallback } from 'react';
import {
  Box, Button, IconButton, Chip, Stack, Paper, Typography,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Snackbar, Alert, Collapse, Table, TableHead, TableRow,
  TableCell, TableBody, Tooltip, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import ModalComponent from '../../../components/ModalComponent';
import AdminPagination from '../../../components/Paginations';
import AdminFilters from '../../../components/AdminFilters';
import AddNewProduct from './Components/AddNewProduct';
import AddNewVariant from './Components/AddNewVarient/index.jsx';
import { useAdmin } from '../../../context/AdminContext';
import { deleteProductAction } from '../../../Actions/ProductUploadAction';
import { deleteVariantAction, fetchVariantsAction } from '../../../Actions/ProductVariantAction';
import { resolveProductId } from './AllProductuploadFields';
import { MEDIA_BASE } from '../../../Config/UrlsConfig';

// ── Helpers ───────────────────────────────────────────────────────────────────
const resolveImg = (p) => !p ? '' : p.startsWith('http') ? p : `${MEDIA_BASE}${p}`;
const getDisplayId = (r) => r?.product_id || '—';
const getDisplayName = (r) => r?.product_name || r?.productName || r?.name || '—';
const getCategoryName = (r) => r?.category_name || r?.category || '—';
const getBestPrice = (r) => {
  const v = Number(r?.selling_price) || Number(r?.price) || Number(r?.mrp) || 0;
  return v > 0 ? `₹${v.toLocaleString('en-IN')}` : '—';
};
const getMRP = (r) => {
  const v = Number(r?.mrp) || 0;
  return v > 0 ? `₹${v.toLocaleString('en-IN')}` : null;
};
const getTotalStock = (r) => {
  if (r?.variants?.length) return r.variants.reduce((s, v) => s + Number(v.stock || 0), 0);
  return Number(r?.stock ?? 0);
};
const parseJson = (val) => {
  if (!val) return null;
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return null; }
};

// ── Single detail row ─────────────────────────────────────────────────────────
function DR({ label, value, xs = 6 }) {
  if (value == null || value === '' || value === '0' || value === 0) return null;
  return (
    <Grid item xs={xs}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2, mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>{String(value)}</Typography>
    </Grid>
  );
}

// ── Full view modal ───────────────────────────────────────────────────────────
function ProductViewModal({ product: p, open, onClose }) {
  if (!p) return null;

  const features = parseJson(p.features);
  const selColors = parseJson(p.selected_colors);
  const variants = Array.isArray(p.variants) ? p.variants : [];
  const mrp = getMRP(p);
  const selling = getBestPrice(p);
  const hasMrp = mrp && mrp !== selling;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper"
      PaperProps={{ sx: { borderRadius: '12px', maxHeight: '92vh' } }}>
      <DialogTitle sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #e8eaed', bgcolor: '#fafafa', px: 3, py: 1.75,
      }}>
        <Box>
          <Typography variant="h6" fontWeight={700} fontSize="1rem">{getDisplayName(p)}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            {getDisplayId(p)} · {getCategoryName(p)}
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip label={p.status === 'published' ? 'Published' : (p.status || 'Draft')}
            size="small" color={p.status === 'published' ? 'success' : 'default'} />
          <IconButton size="small" onClick={onClose}>✕</IconButton>
        </Stack>
      </DialogTitle>

      <Box sx={{ overflowY: 'auto', px: 3, py: 2.5 }}>
        {/* Pricing strip */}
        <Paper elevation={0} sx={{
          bgcolor: '#f0f7ff', border: '1px solid #e3f2fd',
          borderRadius: '8px', px: 2.5, py: 1.5, mb: 2.5, display: 'flex',
          flexWrap: 'wrap', gap: 3, alignItems: 'center'
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Selling Price</Typography>
            <Typography variant="h6" fontWeight={700} color="primary">{selling}</Typography>
          </Box>
          {hasMrp && (
            <Box>
              <Typography variant="caption" color="text.secondary">MRP</Typography>
              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>{mrp}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">Stock</Typography>
            <Typography variant="body2" fontWeight={600}>{getTotalStock(p)} units</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Variants</Typography>
            <Typography variant="body2" fontWeight={600}>{variants.length}</Typography>
          </Box>
          {p.brand && (
            <Chip label={p.brand} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
          )}
          {selColors?.map((c) => (
            <Tooltip key={c.label} title={c.label}>
              <Box sx={{
                width: 20, height: 20, borderRadius: '50%',
                bgcolor: c.hex, border: '2px solid #fff', boxShadow: '0 0 0 1px #ddd'
              }} />
            </Tooltip>
          ))}
        </Paper>

        {/* Product attributes */}
        <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>
          Product Details
        </Typography>
        <Grid container spacing={1.5} mb={2.5}>
          <DR label="Product ID" value={p.product_id} />
          <DR label="Generic Name" value={p.generic_name} />
          <DR label="Brand" value={p.brand} />
          <DR label="Category" value={getCategoryName(p)} />
          <DR label="Material" value={p.material} />
          <DR label="Pattern" value={p.pattern} />
          <DR label="Character" value={p.character_name} />
          <DR label="Gender" value={p.gender} />
          <DR label="Class Type" value={p.class_type} />
          <DR label="Backpack Style" value={p.backpack_style} />
          <DR label="Capacity" value={p.capacity} />
          <DR label="Recommended Age" value={p.recommended_age} />
          <DR label="Size" value={p.size} />
          <DR label="Net Weight" value={p.net_weight} />
          <DR label="Country of Origin" value={p.country_of_origin} />
          <DR label="Actual Cost Price" value={p.actual_cost_price ? `₹${Number(p.actual_cost_price).toLocaleString('en-IN')}` : null} />
          <DR label="GST" value={p.gst ? `${p.gst}%` : null} />
          <DR label="Created At" value={p.created_at} />
        </Grid>

        {/* Visibility flags */}
        <Box mb={2.5}>
          <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>Visibility</Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {[
              ['Live', p.is_live === '1'],
              ['New Arrival', p.is_new_arrival === '1'],
              ['Card Slider', p.show_in_card_slider === '1'],
              ['Published', p.is_published === '1'],
              ['Visible on Web', p.is_visible_on_website === '1'],
              ['Homepage Banner', p.homepage_banner_enabled === '1'],
            ].map(([label, active]) => (
              <Chip key={label} label={label} size="small"
                color={active ? 'success' : 'default'} variant={active ? 'filled' : 'outlined'}
                sx={{ fontSize: '0.7rem' }} />
            ))}
          </Stack>
        </Box>

        {/* Descriptions */}
        {(p.short_description || p.full_description) && (
          <Box mb={2.5}>
            <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>Description</Typography>
            {p.short_description && (
              <Typography variant="body2" color="text.secondary" mb={0.75}>{p.short_description}</Typography>
            )}
            {p.full_description && p.full_description !== p.short_description && (
              <Typography variant="body2">{p.full_description}</Typography>
            )}
          </Box>
        )}

        {/* Features */}
        {features?.length > 0 && (
          <Box mb={2.5}>
            <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>Features</Typography>
            {features.map((f, i) => (
              <Box key={i} sx={{ mb: 0.5 }}>
                {f.title && <Typography variant="body2" fontWeight={600}>{f.title}</Typography>}
                {f.description && <Typography variant="caption" color="text.secondary">{f.description}</Typography>}
                {typeof f === 'string' && <Typography variant="body2">• {f}</Typography>}
              </Box>
            ))}
          </Box>
        )}

        {/* Variants */}
        <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>
          Variants ({variants.length})
        </Typography>
        {variants.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No variants for this product.</Typography>
        ) : (
          <Box sx={{ border: '1px solid #e3f2fd', borderRadius: '8px', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                  {['Variant ID', 'Color', 'Size', 'MRP', 'Selling', 'Discount', 'Stock', 'SKU', 'Status'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'primary.dark', py: 1 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {variants.map((v) => (
                  <TableRow key={v.variant_id || v.id} hover>
                    <TableCell sx={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600 }}>
                      {v.variant_id || v.id}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={0.75}>
                        {v.color_hex && (
                          <Box sx={{
                            width: 12, height: 12, borderRadius: '50%',
                            bgcolor: v.color_hex, border: '1px solid #ddd', flexShrink: 0
                          }} />
                        )}
                        <Typography sx={{ fontSize: '0.72rem' }}>{v.color_name || '—'}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem' }}>{v.size || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                      {Number(v.mrp) > 0 ? `₹${Number(v.mrp).toLocaleString('en-IN')}` : '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'primary.main' }}>
                      ₹{Number(v.selling_price || 0).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', color: 'success.dark' }}>
                      {Number(v.discount_price) > 0 ? `₹${Number(v.discount_price).toLocaleString('en-IN')}` : '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{v.stock}</TableCell>
                    <TableCell sx={{ fontSize: '0.71rem', fontFamily: 'monospace' }}>{v.sku || '—'}</TableCell>
                    <TableCell>
                      <Chip label={v.status === '1' || v.status === 'active' ? 'Active' : v.status || '—'}
                        size="small" color={v.status === '1' || v.status === 'active' ? 'success' : 'default'}
                        sx={{ fontSize: '0.62rem' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>

      <Box sx={{ px: 3, py: 1.75, borderTop: '1px solid #e8eaed', display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </Box>
    </Dialog>
  );
}

// ── Variant sub-table (inline, from API data) ─────────────────────────────────
function VariantTable({ productId, variants, loading, onAdd, onEdit, onDelete }) {
  if (loading) return (
    <Box sx={{ p: 2, color: 'text.secondary', fontSize: '0.8rem' }}>Loading variants…</Box>
  );
  return (
    <Box sx={{ px: 3, py: 2, bgcolor: '#f0f7ff', borderTop: '1px solid #e3f2fd' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}
      sx={{
        display:'flex',
        justifyContent:'space-between'
      }}
      >
        <Typography variant="body2" fontWeight={700} color="primary">
          Variants ({variants.length}) — {productId}
        </Typography>
        <Button size="small" startIcon={<AddCircleOutlinedIcon />} variant="outlined" onClick={onAdd}>
          Add Variant
        </Button>
      </Stack>

      {variants.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1,
          textAlign:'center'
         }}>
          No variants yet. Click "Add Variant" to create one.
        </Typography>
      ) : (
        <Box sx={{ border: '1px solid #e3f2fd', borderRadius: '8px', overflow: 'hidden' }}>
          <Table size="small" sx={{ bgcolor: 'background.paper' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                {['Variant ID', 'Color', 'Size', 'MRP', 'Selling Price', 'Stock', 'SKU', 'Status', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'primary.dark', py: 1 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.map((v) => (
                <TableRow key={v.variant_id || v.id} hover>
                  <TableCell sx={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                    {v.variant_id || v.id || '—'}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={0.75}>
                      {v.color_hex && (
                        <Box sx={{
                          width: 13, height: 13, borderRadius: '50%',
                          bgcolor: v.color_hex, border: '1px solid #ddd', flexShrink: 0
                        }} />
                      )}
                      <Typography sx={{ fontSize: '0.75rem' }}>{v.color_name || '—'}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{v.size || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {Number(v.mrp) > 0 ? `₹${Number(v.mrp).toLocaleString('en-IN')}` : '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'primary.main' }}>
                    ₹{Number(v.selling_price || 0).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{v.stock ?? '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{v.sku || '—'}</TableCell>
                  <TableCell>
                    <Chip label={v.status === '1' || v.status === 'active' ? 'Active' : (v.status || '—')}
                      size="small" color={v.status === '1' || v.status === 'active' ? 'success' : 'default'}
                      sx={{ fontSize: '0.63rem' }} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.25}>
                      <Tooltip title="Edit variant">
                        <IconButton size="small" color="primary" onClick={() => onEdit(v)}>
                          <EditOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete variant">
                        <IconButton size="small" color="error" onClick={() => onDelete(v)}>
                          <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}

// ── Expandable product row ────────────────────────────────────────────────────
function ProductRow({ row, index, expanded, onExpand, onView, onEdit, onDelete,
  variants, variantsLoading, onAddVariant, onEditVariant, onDeleteVariant }) {
  const variantCount = Array.isArray(row.variants) ? row.variants.length : 0;

  return (
    <>
      <TableRow hover sx={{ bgcolor: expanded ? '#f8f9ff' : undefined }}>
        <TableCell sx={{ width: 36, px: 1 }}>
          <Tooltip title={expanded ? 'Collapse variants' : `Show variants (${variantCount})`}>
            <IconButton size="small" onClick={() => onExpand(row)}>
              {expanded
                ? <KeyboardArrowUpIcon fontSize="small" sx={{ color: '#ed6c02' }} />
                : <KeyboardArrowDownIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell sx={{ fontWeight: 500, color: 'text.secondary', width: 36, fontSize: '0.8rem' }}>
          {index + 1}
        </TableCell>
        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600 }}>
          {getDisplayId(row)}
        </TableCell>
        <TableCell>
          <Box>
            <Typography variant="body2" fontWeight={500}>{getDisplayName(row)}</Typography>
            {row.brand && (
              <Typography variant="caption" color="text.secondary">{row.brand}</Typography>
            )}
          </Box>
        </TableCell>
        <TableCell sx={{ fontSize: '0.8rem' }}>{getCategoryName(row)}</TableCell>
        <TableCell>
          <Box>
            <Typography variant="body2" fontWeight={700} color="primary">
              {getBestPrice(row)}
            </Typography>
            {getMRP(row) && getMRP(row) !== getBestPrice(row) && (
              <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                {getMRP(row)}
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell sx={{ fontSize: '0.8rem' }}>{getTotalStock(row)}</TableCell>
        <TableCell>
          <Chip
            label={row.status === 'published' ? 'Active' : (row.status || 'Draft')}
            size="small"
            color={row.status === 'published' ? 'success' : 'default'}
            sx={{ fontSize: '0.68rem' }}
          />
        </TableCell>
        <TableCell sx={{ fontSize: '0.72rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString('en-IN',
              { day: '2-digit', month: 'short', year: 'numeric' })
            : '—'}
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={0.25} justifyContent="flex-end">
            <Tooltip title="View details">
              <IconButton size="small" color="info" onClick={() => onView(row)}>
                <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit product">
              <IconButton size="small" color="primary" onClick={() => onEdit(row)}>
                <EditOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete product">
              <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Variant sub-table */}
      <TableRow>
        <TableCell colSpan={10} sx={{ p: 0, border: 0 }}>
          <Collapse in={expanded} unmountOnExit>
            <VariantTable
              productId={getDisplayId(row)}
              variants={variants}
              loading={variantsLoading}
              onAdd={() => onAddVariant(row)}
              onEdit={onEditVariant}
              onDelete={onDeleteVariant}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ── Main Products Page ─────────────────────────────────────────────────────────
function ProductsPage() {
  const { products, productsLoading, upsertProduct, deleteProduct, refreshProducts } = useAdmin();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Expanded row — use inline variants from API, fallback to fetch
  const [expandedId, setExpandedId] = useState(null);
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  // Modals
  const [editModal, setEditModal] = useState({ open: false, product: null });
  const [viewModal, setViewModal] = useState({ open: false, product: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [variantModal, setVariantModal] = useState({ open: false, product: null, variant: null });
  const [deleteVariantDialog, setDeleteVariantDialog] = useState({ open: false, variant: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev });

  // Filter
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter((p) =>
      getDisplayName(p).toLowerCase().includes(q) ||
      getDisplayId(p).toLowerCase().includes(q) ||
      getCategoryName(p).toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q)
    );
  }, [products, search]);

  const pagedProducts = useMemo(
    () => filteredProducts.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [filteredProducts, page, rowsPerPage],
  );

  // Expand — use inline variants from product data; only call API if inline is empty
  const handleExpand = useCallback(async (row) => {
    const id = getDisplayId(row);
    if (expandedId === id) { setExpandedId(null); setVariants([]); return; }
    setExpandedId(id);

    // Products API already embeds variants[] — use them immediately
    const inline = Array.isArray(row.variants) ? row.variants : [];
    setVariants(inline);
    console.log(`[Products] Expanded ${id} — ${inline.length} inline variant(s)`);

    // Only call GetProductVariants if inline is empty (and handle gracefully)
    if (inline.length === 0) {
      setVariantsLoading(true);
      try {
        const fresh = await fetchVariantsAction(id);
        if (Array.isArray(fresh) && fresh.length > 0) {
          setVariants(fresh);
        }
      } catch { /* keep empty — broken backend endpoint */ }
      finally { setVariantsLoading(false); }
    }
  }, [expandedId]);

  // Handlers
  const handleProductSuccess = async (saved, status) => {
    console.group(`✅ [Product] ${status === 'draft' ? 'DRAFT saved' : 'PUBLISHED'}`);
    console.log('product_id :', saved?.product_id || saved?.data?.product_id);
    console.log('name       :', saved?.product_name || saved?.data?.product_name);
    console.log('status     :', status);
    console.log('response   :', saved);
    console.groupEnd();
    upsertProduct(saved);
    setEditModal({ open: false, product: null });
    showSnack(status === 'draft' ? 'Saved as draft' : 'Product saved');
    try { await refreshProducts(); } catch { /* silent */ }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refreshProducts(); showSnack('Products refreshed'); }
    catch { showSnack('Refresh failed', 'error'); }
    finally { setRefreshing(false); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.product) return;
    const pid = deleteDialog.product.id ?? resolveProductId(deleteDialog.product);
    console.group('🗑️ [Product] DELETE');
    console.log('id         :', pid);
    console.log('product_id :', deleteDialog.product.product_id);
    console.log('name       :', getDisplayName(deleteDialog.product));
    console.groupEnd();
    try {
      await deleteProductAction(pid);
      deleteProduct(pid);
      console.log('✅ [Product] Deleted:', pid);
      showSnack('Product deleted');
    } catch (err) {
      console.error('❌ [Product] Delete failed:', err.message);
      showSnack(err.message || 'Delete failed', 'error');
    }
    setDeleteDialog({ open: false, product: null });
  };

  const handleVariantSuccess = async (result) => {
    const apiOk = result?.success !== false;
    console.log('✅ [Variant] Saved — refreshing product list');
    showSnack(
      result?.message || (apiOk ? 'Variant saved successfully' : 'Variant saved (API unavailable)'),
      apiOk ? 'success' : 'warning'
    );

    setVariantModal((prev) => ({ ...prev, variant: null }));

    // Refresh products — variants are embedded in the product list response
    try {
      await refreshProducts();
      // After refresh, update expanded row's variants from the fresh product data
      // Products/index will re-render with updated row.variants automatically
    } catch { /* silent */ }
  };

  const handleConfirmDeleteVariant = async () => {
    if (!deleteVariantDialog.variant) return;
    const vid = deleteVariantDialog.variant.variant_id || deleteVariantDialog.variant.id;
    console.group('🗑️ [Variant] DELETE from product row');
    console.log('variant_id :', vid);
    console.log('sku        :', deleteVariantDialog.variant.sku);
    console.log('product_id :', expandedId);
    console.groupEnd();
    try {
      await deleteVariantAction(vid, expandedId);
      setVariants((v) => v.filter((x) => (x.variant_id || x.id) !== vid));
      console.log('✅ [Variant] Deleted from row:', vid);
      showSnack('Variant deleted');
    } catch (err) {
      console.error('❌ [Variant] Delete from row failed:', err.message);
      showSnack(err.message || 'Delete failed', 'error');
    }
    setDeleteVariantDialog({ open: false, variant: null });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        mb: 3, flexWrap: 'wrap', gap: 2
      }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Products</Typography>
          <Typography variant="body2" color="text.secondary">
            {productsLoading ? 'Loading…' : `${filteredProducts.length} of ${products.length} products`}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh} disabled={refreshing || productsLoading}>
              <RefreshIcon fontSize="small" sx={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
              }} />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => setEditModal({ open: true, product: null })}>
            Add New Product
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <AdminFilters onSearch={(s) => { setSearch(s); setPage(0); }}
        searchPlaceholder="Search by name, ID, category, brand…" showDateFilter={false} />

      {/* Table */}
      <Paper elevation={0} sx={{
        border: '1px solid', borderColor: 'divider',
        borderRadius: '8px', overflow: 'hidden'
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ width: 44, p: 1 }} />
              <TableCell sx={{ fontWeight: 700, width: 36 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  {productsLoading ? 'Loading products…'
                    : search ? `No products match "${search}"`
                      : 'No products yet. Click Add New Product to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              pagedProducts.map((row, i) => (
                <ProductRow key={row.product_id || row.id}
                  row={row} index={page * rowsPerPage + i}
                  expanded={expandedId === getDisplayId(row)}
                  onExpand={handleExpand}
                  onView={(r) => setViewModal({ open: true, product: r })}
                  onEdit={(r) => setEditModal({ open: true, product: r })}
                  onDelete={(r) => setDeleteDialog({ open: true, product: r })}
                  variants={expandedId === getDisplayId(row) ? variants : (row.variants || [])}
                  variantsLoading={expandedId === getDisplayId(row) && variantsLoading}
                  onAddVariant={(r) => setVariantModal({ open: true, product: r, variant: null })}
                  onEditVariant={(v) => setVariantModal({ open: true, product: null, variant: v })}
                  onDeleteVariant={(v) => setDeleteVariantDialog({ open: true, variant: v })}
                />
              ))
            )}
          </TableBody>
        </Table>
        <AdminPagination page={page} totalRecords={filteredProducts.length} rowsPerPage={rowsPerPage}
          onPageChange={setPage} onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }} />
      </Paper>

      {/* Add/Edit Product */}
      <ModalComponent open={editModal.open} onClose={() => setEditModal({ open: false, product: null })}
        title={editModal.product ? 'Edit Product' : 'Add New Product'} maxWidth="lg">
        <AddNewProduct editingProduct={editModal.product} onSuccess={handleProductSuccess}
          onCancel={() => setEditModal({ open: false, product: null })} />
      </ModalComponent>

      {/* View Product — full detail with variants */}
      <ProductViewModal
        product={viewModal.product}
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, product: null })}
      />

      {/* Add/Edit Variant */}
      <ModalComponent open={variantModal.open}
        onClose={() => setVariantModal({ open: false, product: null, variant: null })}
        title={variantModal.variant ? 'Edit Product Variant' : 'Add Product Variant'} maxWidth="lg">
        <AddNewVariant
          productId={variantModal.product ? getDisplayId(variantModal.product) : expandedId}
          editingVariant={variantModal.variant}
          onSuccess={handleVariantSuccess}
          onCancel={() => setVariantModal({ open: false, product: null, variant: null })} />
      </ModalComponent>

      {/* Delete Product */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, product: null })}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete &quot;{getDisplayName(deleteDialog.product || {})}&quot;? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, product: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Variant */}
      <Dialog open={deleteVariantDialog.open}
        onClose={() => setDeleteVariantDialog({ open: false, variant: null })}>
        <DialogTitle>Delete Variant</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete variant &quot;{deleteVariantDialog.variant?.variant_id || ''}&quot;? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteVariantDialog({ open: false, variant: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDeleteVariant}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProductsPage;
