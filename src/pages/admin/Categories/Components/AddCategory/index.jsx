import { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import {
  emptyCategoryForm,
  mapCategoryToForm,
  buildCategoryApiPayload,
  validateCategoryForm,
  hasValidationErrors,
  resolveCategoryId,
} from '../../categoryFields';
import { createCategoryAction, updateCategoryAction } from '../../../../../Actions/CategoryAction';
import { notifyError } from '../../../../../utils/toastNotify';

function AddCategory({ editingCategory = null, onSuccess, onCancel }) {
  const [form, setForm] = useState(emptyCategoryForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isEditing = Boolean(resolveCategoryId(editingCategory));

  useEffect(() => {
    setForm(editingCategory ? mapCategoryToForm(editingCategory) : emptyCategoryForm);
    setErrors({});
    setSubmitError('');
  }, [editingCategory]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const validationErrors = validateCategoryForm(form);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError('');

    const apiPayload = buildCategoryApiPayload(form);

    try {
      const result = isEditing
        ? await updateCategoryAction(editingCategory, apiPayload, form)
        : await createCategoryAction(apiPayload, form);

      onSuccess?.(result);
      if (!isEditing) setForm(emptyCategoryForm);
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
      {submitError && (
        <Box sx={{ mb: 2, color: 'error.main', fontSize: '0.875rem' }}>
          {submitError}
        </Box>
      )}

      <TextField
        label="Category Name"
        fullWidth
        required
        autoFocus
        margin="normal"
        value={form.name}
        onChange={handleChange('name')}
        error={Boolean(errors.name)}
        helperText={errors.name || 'e.g. School Backpacks'}
        placeholder="Enter category name"
      />

      <TextField
        label="Description (optional)"
        fullWidth
        multiline
        rows={3}
        margin="normal"
        value={form.description}
        onChange={handleChange('description')}
        error={Boolean(errors.description)}
        helperText={errors.description || 'Short description for this category'}
        placeholder="Describe this category…"
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {isEditing ? 'Update Category' : 'Add Category'}
        </Button>
      </Box>
    </Box>
  );
}

export default AddCategory;
