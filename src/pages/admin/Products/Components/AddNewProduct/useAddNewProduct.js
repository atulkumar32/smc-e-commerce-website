import { useState, useEffect } from 'react';
import {
  emptyProductForm,
  mapProductToForm,
  buildProductPayload,
  validateProductForm,
  hasValidationErrors,
  resolveProductId,
  generateProductId,
} from '../../AllProductuploadFields';
import { createProductAction, updateProductAction } from '../../../../../Actions/ProductUploadAction';
import useProductCategories from './useProductCategories';

function useAddNewProduct({ editingProduct = null, onSuccess } = {}) {
  const [form, setForm] = useState(emptyProductForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useProductCategories();

  const isEditing = Boolean(resolveProductId(editingProduct));

  useEffect(() => {
    if (editingProduct) {
      setForm(mapProductToForm(editingProduct));
    } else {
      setForm(emptyProductForm);
    }
    setErrors({});
    setSubmitError('');
  }, [editingProduct]);

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSubmitError('');
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value; // "SMC-CATE-0001"
    const selected = categories.find((opt) => opt.value === categoryId);

    setForm((prev) => ({
      ...prev,
      categoryId,                      // "SMC-CATE-0001" — sent as category_id to backend
      categoryName: selected?.label || '',
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.categoryId;
      return next;
    });
    setSubmitError('');
  };

  const setFieldValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSubmitError('');
  };

  const handleImagesChange = (images, imageError = '') => {
    setForm((prev) => ({ ...prev, images }));
    setErrors((prev) => {
      const next = { ...prev };
      if (imageError) {
        next.images = imageError;
      } else {
        delete next.images;
      }
      return next;
    });
    setSubmitError('');
  };

  const handleColorSelect = (colorOption) => {
    setForm((prev) => ({
      ...prev,
      color: colorOption.label,
      colorHex: colorOption.hex,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.color;
      return next;
    });
  };

  const submitProduct = async (status) => {
    const mode = status === 'draft' ? 'draft' : 'publish';

    const validationErrors = validateProductForm(form, mode);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError('');

    const productId = isEditing
      ? resolveProductId(editingProduct)
      : generateProductId();

    // Build payload — images excluded (handled separately via variants)
    // preparedImages is passed as [] until image upload is re-enabled
    const payload = buildProductPayload(
      form,
      status,
      [],          // ← images commented out
      productId,
      categories
    );

    // Extra safety for update: make sure product_id matches the original record
    if (isEditing && productId) {
      payload.product_id = productId;
    }

    // ── Console log the exact payload being sent ─────────────────────────────
    console.group(`📦 [Product API] ${isEditing ? 'UPDATE' : 'CREATE'} — payload`);
    console.log('Mode     :', status);
    console.log('ProductID:', productId);
    console.log('Payload  :');
    console.table(
      Object.entries(payload).map(([key, value]) => ({
        key,
        value: typeof value === 'string' && value.length > 80
          ? `${value.slice(0, 80)}…`
          : value,
        type: typeof value,
      }))
    );
    console.log('Raw payload object:', payload);
    console.groupEnd();

    try {
      let savedProduct;
      if (isEditing) {
        savedProduct = await updateProductAction(productId, payload);
      } else {
        savedProduct = await createProductAction(payload);
      }

      console.log('✅ [Product API] Success:', savedProduct);

      onSuccess?.(savedProduct, status);
      if (!isEditing) {
        setForm(emptyProductForm);
      }
      setErrors({});
    } catch (err) {
      console.error('❌ [Product API] Failed:', err.message, { productId, status, isEditing });
      setSubmitError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    submitError,
    loading,
    isEditing,
    categories,
    categoriesLoading,
    categoriesError,
    handleChange,
    handleCategoryChange,
    handleImagesChange,
    handleColorSelect,
    setFieldValue,
    submitProduct,
  };
}

export default useAddNewProduct;
