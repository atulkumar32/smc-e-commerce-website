import { useState, useEffect } from 'react';
import {
  emptyProductForm,
  mapProductToForm,
  buildProductPayload,
  validateProductForm,
  hasValidationErrors,
  prepareImagesForPayload,
  resolveProductId,
  generateProductId,
} from '../../AllProductuploadFields';
import { createProductAction, updateProductAction } from '../../../../../Actions/ProductUploadAction';
import { apiDebug, apiDebugError, sanitizePayloadForLog } from '../../../../../utils/apiDebug';
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
      apiDebug('Form loaded for edit', {
        product_id: resolveProductId(editingProduct),
        product: sanitizePayloadForLog(editingProduct),
      });
    } else {
      setForm(emptyProductForm);
      apiDebug('Form reset — new product');
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
    apiDebug('Images updated', {
      count: images.length,
      files: images.map((img) => ({
        name: img.name,
        type: img.type,
        isExisting: img.isExisting,
        hasFile: Boolean(img.file),
      })),
      imageError: imageError || null,
    });
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

    apiDebug('Step 1 — Submit started', {
      mode,
      status,
      isEditing,
      formSummary: {
        productName: form.productName,
        categoryId: form.categoryId,
        categoryName: form.categoryName,
        price: form.price,
        stock: form.stock,
        imageCount: form.images?.length ?? 0,
        isPublished: form.isPublished,
      },
    });

    const validationErrors = validateProductForm(form, mode);

    if (hasValidationErrors(validationErrors)) {
      apiDebug('Step 1b — Validation failed', { validationErrors });
      setErrors(validationErrors);
      return;
    }

    apiDebug('Step 1b — Validation passed');

    setLoading(true);
    setSubmitError('');

    let preparedImages;
    try {
      apiDebug('Step 1c — Preparing images…');
      preparedImages = await prepareImagesForPayload(form.images);
      apiDebug('Step 1c — Images prepared', {
        count: preparedImages.length,
      });
    } catch (imgErr) {
      apiDebugError('Step 1c — Image preparation failed', imgErr);
      setSubmitError('Failed to process images. Please try again.');
      setLoading(false);
      return;
    }

    const productId = isEditing
      ? resolveProductId(editingProduct)
      : generateProductId();

    const payload = buildProductPayload(
      form,
      status,
      preparedImages,
      productId,
      categories
    );

    apiDebug('Step 1e — Payload built', sanitizePayloadForLog(payload));

    try {
      let savedProduct;
      if (isEditing) {
        savedProduct = await updateProductAction(productId, payload);
      } else {
        savedProduct = await createProductAction(payload);
      }

      apiDebug('Step 7 — Submit success', {
        status,
        savedProduct: sanitizePayloadForLog(savedProduct),
      });

      onSuccess?.(savedProduct, status);
      if (!isEditing) {
        setForm(emptyProductForm);
      }
      setErrors({});
    } catch (err) {
      apiDebugError('Step 7 — Submit failed', err, {
        productId,
        status,
        isEditing,
      });
      setSubmitError(
        err.message || 'Failed to save product. Please try again.'
      );
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
