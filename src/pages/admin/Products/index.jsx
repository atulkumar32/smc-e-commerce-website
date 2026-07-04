import { useState, useMemo } from 'react';
import {
  Box, Button, IconButton, Chip, Stack,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Typography, Divider, Grid, Snackbar, Alert, Paper,
} from '@mui/material';
import AddIcon                from '@mui/icons-material/Add';
import EditOutlinedIcon       from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon     from '@mui/icons-material/DeleteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RefreshIcon            from '@mui/icons-material/Refresh';
import ModalComponent    from '../../../components/ModalComponent';
import TableComponent    from '../../../components/TableComponent';
import AdminPagination   from '../../../components/Paginations';
import AdminFilters      from '../../../components/AdminFilters';
import AddNewProduct     from './Components/AddNewProduct';
import { useAdmin }      from '../../../context/AdminContext';
import { deleteProductAction }  from '../../../Actions/ProductUploadAction';
import { resolveProductId }     from './AllProductuploadFields';
import { MEDIA_BASE }           from '../../../Config/UrlsConfig';

// ── helpers ───────────────────────────────────────────────────────────────────
function resolveImg(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${MEDIA_BASE}${path}`;
}

function getDisplayId(row)       { return row.product_id   || '—'; }
function getDisplayName(row)     { return row.product_name || row.productName || row.name || '—'; }
function getCategoryName(row)    { return row.category_name || row.category || '—'; }

// ── Product detail row ────────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Grid>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ProductViewDetails({ product: p }) {
  if (!p) return null;
  const name = getDisplayName(p);

  return (
    <Box>
      {/* Images */}
      {p.images?.length > 0 ? (
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
          {p.images.map((img, i) => {
            const src = resolveImg(img.image_url || img.url || '');
            return src ? (
              <Box key={i} sx={{ position: 'relative' }}>
                <Box
                  component="img" src={src} alt={`img-${i}`}
                  sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1,
                    border: img.is_main ? '2px solid' : '1px solid',
                    borderColor: img.is_main ? 'primary.main' : 'divider' }}
                />
                {img.is_main && (
                  <Typography variant="caption" sx={{
                    position: 'absolute', bottom: 2, left: 2,
                    bgcolor: 'primary.main', color: '#fff', px: 0.5, borderRadius: 0.5, fontSize: 9,
                  }}>Main</Typography>
                )}
              </Box>
            ) : null;
          })}
        </Stack>
      ) : (
        <Box sx={{ width: '100%', height: 100, bgcolor: 'grey.100', borderRadius: 1, mb: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary">No images</Typography>
        </Box>
      )}

      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Typography variant="subtitle1" fontWeight={700} flex={1}>{name}</Typography>
        <Chip label={p.status || 'draft'} size="small"
          color={p.status === 'published' ? 'success' : 'default'} variant="outlined" />
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={1.5}>
        <DetailRow label="Product ID"        value={p.product_id} />
        <DetailRow label="Generic Name"      value={p.generic_name || p.genericName} />
        <DetailRow label="Brand"             value={p.brand} />
        <DetailRow label="Category"          value={p.category_name || p.category} />
        <DetailRow label="Price"             value={p.price ? `₹${Number(p.price).toFixed(2)}` : null} />
        <DetailRow label="Discount Price"    value={p.discount_price ? `₹${Number(p.discount_price).toFixed(2)}` : null} />
        <DetailRow label="Stock"             value={p.stock} />
        <DetailRow label="Color"             value={p.color} />
        <DetailRow label="Material"          value={p.material} />
        <DetailRow label="Pattern"           value={p.pattern} />
        <DetailRow label="Character"         value={p.character_name || p.character} />
        <DetailRow label="Gender"            value={p.gender} />
        <DetailRow label="Class"             value={p.class_type || p.productClass} />
        <DetailRow label="Backpack Style"    value={p.backpack_style || p.backpackStyle} />
        <DetailRow label="Bag Capacity"      value={p.capacity || p.bagCapacity} />
        <DetailRow label="Net Quantity"      value={p.net_quantity ?? p.netQuantity} />
        <DetailRow label="Net Weight"        value={p.net_weight || p.netWeight} />
        <DetailRow label="Recommended Age"   value={p.recommended_age || p.recommendedAge} />
        <DetailRow label="Size"              value={p.size} />
        <DetailRow label="Country of Origin" value={p.country_of_origin || p.countryOfOrigin} />
        <DetailRow label="Created"           value={p.created_at || p.createdAt} />
        <DetailRow label="Updated"           value={p.updated_at || p.updatedAt} />
      </Grid>

      {p.description && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            Description
          </Typography>
          <Typography variant="body2">{p.description}</Typography>
        </>
      )}
    </Box>
  );
}

// ── Main Products Page ─────────────────────────────────────────────────────────
function ProductsPage() {
  const { products, productsLoading, upsertProduct, deleteProduct, refreshProducts } = useAdmin();

  // Pagination — default 10 rows
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Client-side filter
  const [search, setSearch] = useState('');

  // Modals
  const [editModal,    setEditModal]    = useState({ open: false, product: null });
  const [viewModal,    setViewModal]    = useState({ open: false, product: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [snackbar,     setSnackbar]     = useState({ open: false, message: '', severity: 'success' });
  const [refreshing,   setRefreshing]   = useState(false);

  const showSnack = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ── Filter products client-side ──────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter((p) =>
      getDisplayName(p).toLowerCase().includes(q)       ||
      getDisplayId(p).toLowerCase().includes(q)         ||
      getCategoryName(p).toLowerCase().includes(q)      ||
      (p.brand || '').toLowerCase().includes(q)         ||
      (p.color || '').toLowerCase().includes(q)
    );
  }, [products, search]);

  // Current page slice
  const pagedProducts = useMemo(
    () => filteredProducts.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [filteredProducts, page, rowsPerPage],
  );

  // ── Filter handler ───────────────────────────────────────────────────────────
  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setPage(0);
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleProductSuccess = async (savedProduct, status) => {
    upsertProduct(savedProduct);
    setEditModal({ open: false, product: null });
    showSnack(status === 'draft' ? 'Saved as draft' : 'Product published successfully');
    try { await refreshProducts(); } catch { /* silent */ }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refreshProducts(); showSnack('Products refreshed'); }
    catch { showSnack('Failed to refresh', 'error'); }
    finally { setRefreshing(false); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.product) return;
    try {
      const id = deleteDialog.product.id ?? resolveProductId(deleteDialog.product);
      await deleteProductAction(id);
      deleteProduct(id);
      showSnack('Product deleted successfully');
    } catch (err) {
      showSnack(err.message || 'Failed to delete product', 'error');
    }
    setDeleteDialog({ open: false, product: null });
  };

  // ── Table columns ────────────────────────────────────────────────────────────
  const columns = [
    {
      id: 'product_id',
      label: 'Product ID',
      render: (row) => (
        <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
          {getDisplayId(row)}
        </Typography>
      ),
    },
    {
      id: 'product_name',
      label: 'Product Name',
      render: (row) => (
        <Typography variant="body2" fontWeight={500}>{getDisplayName(row)}</Typography>
      ),
    },
    {
      id: 'category_name',
      label: 'Category',
      render: (row) => (
        <Typography variant="body2">{getCategoryName(row)}</Typography>
      ),
    },
    {
      id: 'stock',
      label: 'Stock',
      render: (row) => {
        const stock = Number(row.stock ?? 0);
        return (
          <Chip
            label={stock > 0 ? `In stock (${stock})` : 'Out of stock'}
            size="small"
            color={stock > 0 ? 'success' : 'error'}
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.status || 'draft'}
          size="small"
          color={row.status === 'published' ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton size="small" color="info" title="View details"
            onClick={() => setViewModal({ open: true, product: row })}>
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary" title="Edit product"
            onClick={() => setEditModal({ open: true, product: row })}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" title="Delete product"
            onClick={() => setDeleteDialog({ open: true, product: row })}>
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Products</Typography>
          <Typography variant="body2" color="text.secondary">
            {productsLoading
              ? 'Loading…'
              : `${filteredProducts.length} of ${products.length} product${products.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" title="Refresh" onClick={handleRefresh}
            disabled={refreshing || productsLoading}>
            <RefreshIcon fontSize="small"
              sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => setEditModal({ open: true, product: null })}>
            Add Product
          </Button>
        </Stack>
      </Box>

      {/* ── Filters ── */}
      <AdminFilters
        onSearch={handleSearch}
        searchPlaceholder="Search by name, ID, category, brand, color…"
        showDateFilter={false}
      />

      {/* ── Table + Pagination ── */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }}>
        <TableComponent
          columns={columns}
          rows={pagedProducts}
          page={0}
          rowsPerPage={rowsPerPage}
          totalCount={pagedProducts.length}
          getRowId={(row) => row.product_id || row.id}
          emptyMessage={
            productsLoading
              ? 'Loading products…'
              : search
              ? `No products match "${search}"`
              : 'No products yet. Click Add Product to get started.'
          }
        />
        <AdminPagination
          page={page}
          totalRecords={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => setPage(p)}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
        />
      </Paper>

      {/* ── Add / Edit Modal ── */}
      <ModalComponent
        open={editModal.open}
        onClose={() => setEditModal({ open: false, product: null })}
        title={editModal.product ? 'Edit Product' : 'Add New Product'}
        maxWidth="lg"
      >
        <AddNewProduct
          editingProduct={editModal.product}
          onSuccess={handleProductSuccess}
          onCancel={() => setEditModal({ open: false, product: null })}
        />
      </ModalComponent>

      {/* ── View Modal ── */}
      <ModalComponent
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, product: null })}
        title="Product Details"
        maxWidth="sm"
      >
        <ProductViewDetails product={viewModal.product} />
      </ModalComponent>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}>
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

export default ProductsPage;
