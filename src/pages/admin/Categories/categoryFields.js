export const emptyCategoryForm = {
  name: '',
  description: '',
};

export function generateCategoryId() {
  return `CAT${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function resolveCategoryId(category) {
  if (!category) return null;
  return category.category_id || category.categoryId || category.id || null;
}

/** Both DB id and category_id — API update needs at least one in the body */
export function resolveCategoryIds(category) {
  if (!category) return { id: null, category_id: null };
  const id =
    category.id != null && category.id !== ''
      ? String(category.id)
      : null;
  const category_id =
    category.category_id || category.categoryId
      ? String(category.category_id || category.categoryId)
      : null;
  return { id, category_id };
}

export function buildCategoryUpdatePayload(form, category) {
  const { id, category_id } = resolveCategoryIds(category);
  const payload = {
    category_name: form.name.trim(),
    description: form.description?.trim() || '',
  };
  if (id) payload.id = id;
  if (category_id) payload.category_id = category_id;
  return payload;
}

export function mapCategoryToForm(category = {}) {
  return {
    // API returns "name" field (not "category_name")
    name: category.name ?? category.category_name ?? '',
    description: category.description ?? '',
  };
}

/** Payload sent to API — only category name & description */
export function buildCategoryApiPayload(form) {
  return {
    category_name: form.name.trim(),
    description: form.description?.trim() ?? '',
  };
}

/** Record for UI / local list after save */
export function buildCategoryLocalRecord(form, categoryId, apiResult = {}) {
  const name = form.name.trim();
  const id =
    apiResult.category_id ||
    apiResult.id ||
    categoryId ||
    generateCategoryId();

  return {
    category_id: id,
    id: apiResult.id ?? id,
    name,
    category_name: name,
    description: form.description?.trim() ?? '',
    created_at:
      apiResult.created_at ||
      apiResult.createdAt ||
      new Date().toISOString().replace('T', ' ').slice(0, 19),
    updated_at:
      apiResult.updated_at ||
      apiResult.updatedAt ||
      new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
}

export function validateCategoryForm(form) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = 'Category name is required';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Category name must be at least 2 characters';
  }

  if (form.description?.trim() && form.description.trim().length > 500) {
    errors.description = 'Description must be under 500 characters';
  }

  return errors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
