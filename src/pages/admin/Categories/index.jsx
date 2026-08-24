import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ModalComponent from '../../../components/ModalComponent';
import TableComponent from '../../../components/TableComponent';
import AddCategory from './Components/AddCategory';
import AddMainCategory from './Components/AddMainCategory';
import {
  fetchCategoriesAction,
  deleteCategoryAction,
} from '../../../Actions/CategoryAction';
import { resolveCategoryId, resolveCategoryIds } from './categoryFields';
import {
  notifyFromApiResponse,
  notifyError,
  showError,
} from '../../../utils/toastNotify';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });
  // ── Main category modal (separate from sub-category modal) ──────────────
  const [mainCatModalOpen, setMainCatModalOpen] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchCategoriesAction();
      // fetchCategoriesAction returns a plain array of normalised category objects
      setCategories(Array.isArray(result) ? result : []);
    } catch (err) {
      showError(err.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openAddModal = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleMainCategorySuccess = (result) => {
    setMainCatModalOpen(false);
    notifyFromApiResponse(result, 'Main category created successfully');
    loadCategories(); // refresh the list
  };

  const handleCategorySuccess = (result) => {    const saved = result?.saved || result;
    const id = resolveCategoryId(saved);

    setCategories((prev) => {
      const exists = prev.some((c) => resolveCategoryId(c) === id);
      if (exists) {
        return prev.map((c) =>
          resolveCategoryId(c) === id ? { ...c, ...saved } : c
        );
      }
      return [saved, ...prev];
    });

    setModalOpen(false);
    setEditingCategory(null);

    notifyFromApiResponse(
      result,
      editingCategory ? 'Category updated successfully' : 'Category added successfully'
    );

    loadCategories();
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.category) return;

    try {
      const result = await deleteCategoryAction(deleteDialog.category);
      const targetIds = resolveCategoryIds(deleteDialog.category);
      setCategories((prev) =>
        prev.filter((c) => {
          const rowIds = resolveCategoryIds(c);
          const matchId = targetIds.id && rowIds.id === targetIds.id;
          const matchCatId =
            targetIds.category_id && rowIds.category_id === targetIds.category_id;
          return !matchId && !matchCatId;
        })
      );
      notifyFromApiResponse(result, 'Category deleted successfully');
    } catch (err) {
      notifyError(err, 'Failed to delete category');
    }

    setDeleteDialog({ open: false, category: null });
  };

  const getCategoryName = (row) => row.label || row.name || row.category_name || '—';

  const columns = [
    // {
    //   id: 'image',
    //   label: 'Image',
    //   render: (row) => {
    //     const imgPath = row.image || row.raw?.image || '';
    //     if (!imgPath) return (
    //       <Box sx={{ width: 40, height: 40, bgcolor: '#f0f4f8', borderRadius: '6px',
    //         display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
    //         🗂️
    //       </Box>
    //     );
    //     // Image paths come as "uploads/..." — prepend the API base
    //     const src = imgPath.startsWith('http')
    //       ? imgPath
    //       : `https://shreemahaveercollections.com/apis/v1/smc/${imgPath}`;
    //     return (
    //       <Box component="img" src={src} alt={getCategoryName(row)}
    //         sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '6px',
    //               border: '1px solid #e8eaed', display: 'block' }}
    //         onError={(e) => { e.currentTarget.style.display = 'none'; }}
    //       />
    //     );
    //   },
    // },
    {
      id: 'category_id',
      label: 'Category ID',
      render: (row) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'text.secondary' }}>
          {row.category_id || row.raw?.category_id || '—'}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Sub-Category Name',
      render: (row) => (
        <Typography fontWeight={500}>{getCategoryName(row)}</Typography>
      ),
    },
    {
      id: 'main_category',
      label: 'Main Category',
      render: (row) => {
        const name = row.main_category_name || row.raw?.main_category_name;
        const id   = row.main_category_id   || row.raw?.main_category_id;
        if (!name && !id) return <Typography variant="body2" color="text.disabled">—</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight={500}>{name || '—'}</Typography>
            {id && (
              <Typography variant="caption" color="text.secondary">ID: {id}</Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'description',
      label: 'Description',
      render: (row) => (
        <Typography variant="body2" color="text.secondary"
          sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.description?.trim() || '—'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => {
        const active = row.raw?.status === 1 || row.raw?.status === '1' || row.raw?.status === 'active';
        return <Chip label={active ? 'Active' : 'Inactive'} size="small" color={active ? 'success' : 'default'} />;
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (row) => {
        const dt = row.raw?.created_at || row.created_at || row.createdAt;
        if (!dt) return '—';
        try {
          return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch { return dt; }
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <IconButton size="small" color="primary" onClick={() => openEditModal(row)} aria-label="Edit category">
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, category: row })} aria-label="Delete category">
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading && categories.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
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
        <Box>
          <Typography variant="h5" fontWeight={700}>Categories</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage product categories for your store
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={openAddModal}
          >
            Add Sub Category
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setMainCatModalOpen(true)}
          >
            Add Main Category
          </Button>
        </Box>
      </Box>

      <TableComponent
        columns={columns}
        rows={categories}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        getRowId={(row) => resolveCategoryId(row)}
        emptyMessage="No categories yet. Click Add New Category to create one."
      />

      {/* ── Sub Category Modal ── */}
      <ModalComponent
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Edit Category' : 'Add Sub Category'}
        maxWidth="sm"
      >
        <AddCategory
          editingCategory={editingCategory}
          onSuccess={handleCategorySuccess}
          onCancel={() => {
            setModalOpen(false);
            setEditingCategory(null);
          }}
        />
      </ModalComponent>

      {/* ── Main Category Modal ── */}
      <ModalComponent
        open={mainCatModalOpen}
        onClose={() => setMainCatModalOpen(false)}
        title="Add Main Category"
        maxWidth="sm"
      >
        <AddMainCategory
          onSuccess={handleMainCategorySuccess}
          onCancel={() => setMainCatModalOpen(false)}
        />
      </ModalComponent>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, category: null })}
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete &quot;{getCategoryName(deleteDialog.category || {})}&quot;? Products
            in this category may be affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, category: null })}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CategoriesPage;
