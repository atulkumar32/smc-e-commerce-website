/**
 * AddMainCategory
 *
 * Modal form to create a new main category.
 * Sends multipart/form-data: name, description, status, image.
 *
 * API: POST createMainCategory.php
 * Success response: { status: true, message, id, data: { name, image, description, status } }
 */
import { useState, useRef } from 'react';
import {
  Box, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Typography, Alert, CircularProgress, Stack, IconButton,
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlinedIcon      from '@mui/icons-material/DeleteOutlined';
import { createMainCategoryAction } from '../../../../../Actions/CategoryAction';

const ACCEPTED = 'image/jpeg,image/jpg,image/png,image/webp';
const MAX_MB   = 5;

function AddMainCategory({ onSuccess, onCancel }) {
  const [form, setForm] = useState({ name: '', description: '', status: 1 });
  const [image,   setImage]   = useState(null);   // File | null
  const [preview, setPreview] = useState('');     // blob URL
  const [errors,  setErrors]  = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const inputRef = useRef(null);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    setSubmitError('');
  };

  const handleImagePick = (files) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((p) => ({ ...p, image: 'Only image files are allowed (JPG, PNG, WEBP)' }));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: `Image must be smaller than ${MAX_MB}MB` }));
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setErrors((p) => { const n = { ...p }; delete n.image; return n; });
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Category name is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError('');

    console.group('📦 [Main Category] Submit');
    console.log('name       :', form.name);
    console.log('description:', form.description);
    console.log('status     :', form.status);
    console.log('image      :', image?.name || '(none)');
    console.groupEnd();

    try {
      const result = await createMainCategoryAction({
        name:        form.name,
        description: form.description,
        status:      form.status,
        image,
      });

      console.log('✅ [Main Category] Created:', result);
      onSuccess?.(result);
    } catch (err) {
      console.error('❌ [Main Category] Failed:', err.message);
      setSubmitError(err.message || 'Failed to create category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      {/* Category Name */}
      <TextField
        label="Category Name *"
        fullWidth size="small"
        value={form.name}
        onChange={set('name')}
        error={!!errors.name}
        helperText={errors.name}
        sx={{ mb: 2 }}
      />

      {/* Description */}
      <TextField
        label="Description"
        fullWidth multiline rows={3} size="small"
        value={form.description}
        onChange={set('description')}
        sx={{ mb: 2 }}
      />

      {/* Status */}
      <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
        <InputLabel>Status</InputLabel>
        <Select value={form.status} onChange={set('status')} label="Status">
          <MenuItem value={1}>Active</MenuItem>
          <MenuItem value={0}>Inactive</MenuItem>
        </Select>
      </FormControl>

      {/* Image upload */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>
          Category Image (JPG, PNG, WEBP — max {MAX_MB}MB)
        </Typography>

        {preview ? (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '8px',
                    border: '1px solid #e0e0e0', display: 'block' }}
            />
            <IconButton
              size="small"
              onClick={removeImage}
              sx={{ position: 'absolute', top: 4, right: 4,
                    bgcolor: 'rgba(0,0,0,0.6)', color: '#fff',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
            >
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
              borderRadius: '8px', p: 3, textAlign: 'center',
              cursor: 'pointer', bgcolor: '#fafafa',
              '&:hover': { borderColor: '#1976d2', bgcolor: '#f0f7ff' },
            }}
          >
            <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: '#9e9e9e', mb: 0.5 }} />
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

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          hidden
          onChange={(e) => { handleImagePick(e.target.files); e.target.value = ''; }}
        />
      </Box>

      {/* Actions */}
      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitting ? 'Creating…' : 'Create Category'}
        </Button>
      </Stack>
    </Box>
  );
}

export default AddMainCategory;
