/**
 * AddCategory — create / edit sub-category.
 *
 * Fields:
 *   category_name      (required)
 *   main_category_id   (required — dropdown from getMainCategories API)
 *   main_category_name (auto-filled from selection)
 *   description        (optional)
 *   image              (optional File upload)
 *
 * Create API: POST CreateCategory.php  (multipart/form-data)
 * Edit  API:  POST UpdateCategory.php  (existing JSON flow)
 */
import { useState, useEffect, useRef } from 'react';
import {
  TextField, Button, Box, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem,
  Typography, Stack, IconButton,
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlinedIcon      from '@mui/icons-material/DeleteOutlined';
import {
  emptyCategoryForm,
  mapCategoryToForm,
  buildCategoryApiPayload,
  validateCategoryForm,
  hasValidationErrors,
  resolveCategoryId,
} from '../../categoryFields';
import {
  createSubCategoryAction,
  updateCategoryAction,
  fetchMainCategoriesAction,
} from '../../../../../Actions/CategoryAction';
import { notifyError } from '../../../../../utils/toastNotify';

const ACCEPTED = 'image/jpeg,image/jpg,image/png,image/webp';
const MAX_MB   = 5;

function AddCategory({ editingCategory = null, onSuccess, onCancel }) {
  const [form,        setForm]        = useState(emptyCategoryForm);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Main categories dropdown
  const [mainCategories, setMainCategories] = useState([]);
  const [mainCatLoading, setMainCatLoading] = useState(true);
  const [selectedMainCat, setSelectedMainCat] = useState(null); // { id, name }

  // Image upload
  const [image,   setImage]   = useState(null);   // File | null
  const [preview, setPreview] = useState('');
  const inputRef = useRef(null);

  const isEditing = Boolean(resolveCategoryId(editingCategory));

  // Load main categories on mount
  useEffect(() => {
    let active = true;
    setMainCatLoading(true);
    fetchMainCategoriesAction()
      .then((list) => { if (active) setMainCategories(list); })
      .catch(() => { if (active) setMainCategories([]); })
      .finally(() => { if (active) setMainCatLoading(false); });
    return () => { active = false; };
  }, []);

  // Pre-fill form for edit
  useEffect(() => {
    setForm(editingCategory ? mapCategoryToForm(editingCategory) : emptyCategoryForm);
    setErrors({});
    setSubmitError('');
    setImage(null);
    setPreview('');
  }, [editingCategory]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    setSubmitError('');
  };

  const handleMainCatChange = (e) => {
    const id   = e.target.value;
    const cat  = mainCategories.find((c) => String(c.id) === String(id));
    setSelectedMainCat(cat || null);
    setErrors((prev) => { const n = { ...prev }; delete n.main_category_id; return n; });
    setSubmitError('');
  };

  // Image
  const handleImagePick = (files) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((p) => ({ ...p, image: 'Only image files allowed (JPG, PNG, WEBP)' })); return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: `Max ${MAX_MB}MB allowed` })); return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setErrors((p) => { const n = { ...p }; delete n.image; return n; });
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null); setPreview('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const validationErrors = validateCategoryForm(form);
    // Additional: require main_category_id for new sub-categories
    if (!isEditing && !selectedMainCat) {
      validationErrors.main_category_id = 'Please select a main category';
    }
    if (hasValidationErrors(validationErrors)) { setErrors(validationErrors); return; }

    setLoading(true);
    setSubmitError('');

    try {
      let result;
      if (isEditing) {
        const apiPayload = buildCategoryApiPayload(form);
        result = await updateCategoryAction(editingCategory, apiPayload, form);
      } else {
        result = await createSubCategoryAction({
          category_name:      form.name,
          main_category_id:   selectedMainCat.id,
          main_category_name: selectedMainCat.name,
          description:        form.description || '',
          image,
        });
      }
      onSuccess?.(result);
      if (!isEditing) {
        setForm(emptyCategoryForm);
        setSelectedMainCat(null);
        removeImage();
      }
    } catch (err) {
      const msg = err.message || 'Failed to save category';
      setSubmitError(msg);
      notifyError(err, msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      {/* Main Category dropdown — only for create */}
      {!isEditing && (
        <FormControl fullWidth size="small" sx={{ mb: 2 }} error={!!errors.main_category_id}>
          <InputLabel>
            {mainCatLoading ? 'Loading main categories…' : 'Main Category *'}
          </InputLabel>
          <Select
            value={selectedMainCat ? String(selectedMainCat.id) : ''}
            label={mainCatLoading ? 'Loading main categories…' : 'Main Category *'}
            onChange={handleMainCatChange}
            disabled={mainCatLoading}
          >
            <MenuItem value=""><em>— Select main category —</em></MenuItem>
            {mainCategories.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.id} — {c.name}
              </MenuItem>
            ))}
          </Select>
          {errors.main_category_id && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
              {errors.main_category_id}
            </Typography>
          )}
        </FormControl>
      )}

      {/* Sub-category name */}
      <TextField
        label="Sub-Category Name *"
        fullWidth size="small" autoFocus
        sx={{ mb: 2 }}
        value={form.name}
        onChange={handleChange('name')}
        error={Boolean(errors.name)}
        helperText={errors.name || 'e.g. School Backpacks'}
        placeholder="Enter sub-category name"
      />

      {/* Description */}
      <TextField
        label="Description"
        fullWidth multiline rows={3} size="small"
        sx={{ mb: 2.5 }}
        value={form.description}
        onChange={handleChange('description')}
        helperText="Short description for this sub-category"
        placeholder="Describe this sub-category…"
      />

      {/* Image upload */}
      {!isEditing && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>
            Sub-Category Image (JPG, PNG, WEBP — max {MAX_MB}MB)
          </Typography>

          {preview ? (
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Box component="img" src={preview} alt="Preview"
                sx={{ width: 110, height: 110, objectFit: 'cover',
                      borderRadius: '8px', border: '1px solid #e0e0e0', display: 'block' }} />
              <IconButton size="small" onClick={removeImage}
                sx={{ position: 'absolute', top: 4, right: 4,
                      bgcolor: 'rgba(0,0,0,0.6)', color: '#fff',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' } }}>
                <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ) : (
            <Box
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleImagePick(e.dataTransfer.files); }}
              sx={{
                border: `2px dashed ${errors.image ? '#d32f2f' : '#bbb'}`,
                borderRadius: '8px', p: 2.5, textAlign: 'center',
                cursor: 'pointer', bgcolor: '#fafafa',
                '&:hover': { borderColor: '#1976d2', bgcolor: '#f0f7ff' },
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: '#9e9e9e', mb: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Click or drag image here
              </Typography>
            </Box>
          )}

          {errors.image && (
            <Typography variant="caption" color="error" mt={0.5} display="block">
              {errors.image}
            </Typography>
          )}
          <input ref={inputRef} type="file" accept={ACCEPTED} hidden
            onChange={(e) => { handleImagePick(e.target.files); e.target.value = ''; }} />
        </Box>
      )}

      {/* Actions */}
      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}>
          {isEditing ? 'Update Category' : 'Create Sub-Category'}
        </Button>
      </Stack>
    </Box>
  );
}

export default AddCategory;
