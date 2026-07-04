import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Divider,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ModalComponent from '../../../components/ModalComponent';
import TableComponent from '../../../components/TableComponent';
import AddNewProduct from './Components/AddNewProduct';
import { useAdmin } from '../../../context/AdminContext';
import { deleteProductAction } from '../../../Actions/ProductUploadAction';
import { resolveProductId } from './AllProductuploadFields';
import { MEDIA_BASE } from '../../../Config/UrlsConfig';

// Resolve a relative image path to a full URL
function resolveImg(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${MEDIA_BASE}${path}`;
}

// ── Product detail row helper ──────────────────────────────────────────────────
function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Grid>
  );
}

// ── View Product Modal content ─────────────────────────────────────────────────
function ProductViewDetails({ product: p }) {
  if (!p) return null;

  const name        = p.product_name  || p.productName  || p.name || '—';
  const mainImg     = p.images?.find((i) => i.is_main) || p.images?.[0];

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
                  component="img"
                  src={src}
                  alt={`Product image ${i + 1}`}
                  sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, border: img.is_main ? '2px solid' : '1px solid', borderColor: img.is_main ? 'primary.main' : 'divider' }}
                />
                {img.is_main && (
                  <Typography variant="caption" sx={{ position: 'absolute', bottom: 2, left: 2, bgcolor: 'primary.main', color: '#fff', px: 0.5, borderRadius: 0.5, fontSize: 9 }}>
                    Main
                  </Typography>
                )}
              </Box>
            ) : null;
          })}
        </Stack>
      ) : (
        <Box sx={{ width: '100%', height: 100, bgcolor: 'grey.100', borderRadius: 1, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary">No images</Typography>
        </Box>
      )}

      {/* Name + status */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Typography variant="subtitle1" fontWeight={700} flex={1}>{name}</Typography>
        <Chip
          label={p.status || 'draft'}
          size="small"
          color={p.status === 'published' ? 'success' : 'default'}
          variant="outlined"
        />
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={1.5}>
        <DetailRow label="Product ID"        value={p.product_id || p.productId} />
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
  const { products, upsertProduct, deleteProduct, refreshProducts } = useAdmin();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [editModal, setEditModal] = useState({ open: false, product: null });
  const [viewModal, setViewModal] = useState({ open: false, product: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleProductSuccess = async (savedProduct, status) => {
    // Optimistic update immediately
    upsertProduct(savedProduct);
    setEditModal({ open: false, product: null });
    showSnack(status === 'draft' ? 'Saved as draft' : 'Product published successfully');
    // Background refresh so list stays in sync with server
    try { await refreshProducts(); } catch { /* silent */ }
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

  // ── Field helpers ────────────────────────────────────────────────────────────
  const getDisplayName = (row) => row.product_name || row.productName || row.name || '—';
  const getCategoryName = (row) => row.category_name || row.category || '—';
  const getPrimaryImage = (row) => {
    // API: images: [{ image_url: "uploads/products/...", is_main: true }]
    const main = row.images?.find((i) => i.is_main) || row.images?.[0];
    const raw = "uploads/products". main?.image_url || main?.url || row.image_url || row.imageUrl || '';
    return resolveImg(raw);
  };

  // ── Table columns (limited) ──────────────────────────────────────────────────
  const columns = [
    // {
    //   id: 'image',
    //   label: 'Image',
    //   render: (row) => {
    //     const src = getPrimaryImage(row);
    //     return src ? (
    //       <Box
    //         component="img"
    //         src={src}
    //         alt={getDisplayName(row)}
    //         sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }}
    //       />
    //     ) : (
    //       <Box sx={{ width: 48, height: 48, bgcolor: 'grey.100', borderRadius: 1 }} />
    //     );
    //   },
    // },
    {
      id: 'product_name',
      label: 'Product Name',
      render: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {getDisplayName(row)}
        </Typography>
      ),
    },
    { id: 'brand', label: 'Brand' },
    {
      id: 'category_name',
      label: 'Category',
      render: (row) => getCategoryName(row),
    },
    {
      id: 'price',
      label: 'Price',
      render: (row) => {
        const mrp = row.mrp ?? row.price;
        const selling = row.selling_price ?? row.price;
        const discount = row.discount_percent ?? row.discountPercent;
        return (
          <Box>
            {mrp && selling && mrp !== selling ? (
              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                ₹{Number(mrp).toFixed(2)}
              </Typography>
            ) : null}
            <Typography variant="body2" fontWeight={600}>
              ₹{Number(selling || mrp || 0).toFixed(2)}
            </Typography>
            {discount ? (
              <Chip label={`${discount}% off`} size="small" color="secondary" sx={{ mt: 0.5 }} />
            ) : null}
          </Box>
        );
      },
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
          {/* View */}
          <IconButton
            size="small"
            color="info"
            title="View details"
            onClick={() => setViewModal({ open: true, product: row })}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
          {/* Edit */}
          <IconButton
            size="small"
            color="primary"
            title="Edit product"
            onClick={() => setEditModal({ open: true, product: row })}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          {/* Delete */}
          <IconButton
            size="small"
            color="error"
            title="Delete product"
            onClick={() => setDeleteDialog({ open: true, product: row })}
          >
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Manage your school bag inventory
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEditModal({ open: true, product: null })}
        >
          Add Product
        </Button>
      </Box>

      {/* ── Table ── */}
      <TableComponent
        columns={columns}
        rows={products}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        emptyMessage="No products yet. Click Add Product to get started."
      />

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
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete &quot;{getDisplayName(deleteDialog.product || {})}&quot;? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, product: null })}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProductsPage;
