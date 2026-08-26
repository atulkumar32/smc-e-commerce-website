/**
 * CategoryAction.js
 *
 * All API calls related to categories.
 * Each operation uses its own dedicated endpoint.
 */

import {
  URL_CATEGORIES_FETCH,
  URL_CATEGORIES_CREATE,
  URL_CATEGORIES_UPDATE,
  URL_CATEGORIES_DELETE,
  URL_MAIN_CATEGORY_CREATE,
  URL_MAIN_CATEGORIES_FETCH,
  URL_MAIN_CATEGORIES_WEB,
} from '../Config/UrlsConfig';

// ── Shared response handler ────────────────────────────────────────────────────
async function handleResponse(response) {
  let data = {};
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    // non-JSON body — treat as empty
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  if (data.status === false) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// ── Fetch all sub-categories from DB ──────────────────────────────────────────
// New API response: { status, page, limit, total_records, total_pages, data: [...] }
export const fetchCategoriesAction = async () => {
  console.log('📡 [Category] GET', URL_CATEGORIES_FETCH);

  const response = await fetch(URL_CATEGORIES_FETCH, { method: 'GET' });
  const data = await handleResponse(response);

  console.log('✅ [Category] FETCH response:', data);

  // Support both old array response and new paginated { data: [...] } shape
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data.data)       ? data.data
    : Array.isArray(data.categories) ? data.categories
    : [];

  return list.map((cat) => ({
    value:              cat.id,
    label:              cat.name ?? cat.category_name ?? '',
    id:                 cat.id,
    category_id:        cat.category_id   || null,
    name:               cat.name          || cat.category_name || '',
    description:        cat.description   ?? '',
    image:              cat.image         || null,
    main_category_id:   cat.main_category_id   ?? null,
    main_category_name: cat.main_category_name  || null,
    raw:                cat,
  }));
};

// ── Fetch all main categories ──────────────────────────────────────────────────
// GET getMainCategories.php → { status, count, data: [{id, name, image, description, status}] }
export const fetchMainCategoriesAction = async () => {
  const response = await fetch(URL_MAIN_CATEGORIES_FETCH, { method: 'GET' });
  const data = await handleResponse(response);
  const list = Array.isArray(data.data) ? data.data : [];
  return list.map((c) => ({
    id:          c.id,
    name:        c.name || '',
    image:       c.image || null,
    description: c.description || '',
    status:      c.status,
  }));
};

// ── Create a new sub-category (multipart/form-data) ────────────────────────────
// POST CreateCategory.php — category_name, main_category_id, main_category_name,
//                           description, image (file, optional)
export const createSubCategoryAction = async ({
  category_name,
  main_category_id,
  main_category_name,
  description = '',
  image,           // File | null
}) => {
  const fd = new FormData();
  fd.append('category_name',      (category_name || '').trim());
  fd.append('main_category_id',   String(main_category_id));
  fd.append('main_category_name', (main_category_name || '').trim());
  fd.append('description',        description.trim());
  if (image instanceof File) {
    fd.append('image', image, image.name);
  }

  console.group('➕ [Sub Category] CREATE');
  console.log('URL              :', URL_CATEGORIES_CREATE);
  console.log('category_name    :', category_name);
  console.log('main_category_id :', main_category_id);
  console.log('main_category_name:', main_category_name);
  console.log('image            :', image?.name || '(none)');
  console.groupEnd();

  const response = await fetch(URL_CATEGORIES_CREATE, {
    method: 'POST',
    body: fd,
  });

  const data = await handleResponse(response);
  console.log('✅ [Sub Category] CREATE response:', data);
  return data;
};

// ── Update a category ──────────────────────────────────────────────────────────
export const updateCategoryAction = async (editingCategory, payload) => {
  const body = {
    ...payload,
    id:          editingCategory?.id          ?? null,
    category_id: editingCategory?.category_id ?? editingCategory?.id ?? null,
  };

  console.group('✏️ [Category] UPDATE');
  console.log('URL         :', URL_CATEGORIES_UPDATE);
  console.log('category_id :', body.category_id);
  console.log('id          :', body.id);
  console.log('payload     :', JSON.stringify(body));
  console.groupEnd();

  const response = await fetch(URL_CATEGORIES_UPDATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await handleResponse(response);
  console.log('✅ [Category] UPDATE response:', data);
  return data;
};

// ── Delete a category ──────────────────────────────────────────────────────────
// DELETE ?category_id=SMC-CATE-0001  (query param only — no body)
export const deleteCategoryAction = async (categoryOrId) => {
  let category_id;
  if (typeof categoryOrId === 'object' && categoryOrId !== null) {
    category_id = categoryOrId.category_id ?? categoryOrId.id ?? null;
  } else {
    category_id = categoryOrId;
  }

  if (!category_id) throw new Error('category_id is required to delete a category');

  const url = `${URL_CATEGORIES_DELETE}?category_id=${encodeURIComponent(category_id)}`;

  console.group('🗑️ [Category] DELETE');
  console.log('URL         :', url);
  console.log('category_id :', category_id);
  console.groupEnd();

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await handleResponse(response);
  console.log('✅ [Category] DELETE response:', data);
  return data;
};

// ── Create a main category (multipart/form-data with optional image) ──────────
// POST createMainCategory.php  — name, description, status, image (file)
export const createMainCategoryAction = async ({ name, description, status = 1, image }) => {
  const fd = new FormData();
  fd.append('name',        name.trim());
  fd.append('description', (description || '').trim());
  fd.append('status',      String(status));
  if (image instanceof File) {
    fd.append('image', image, image.name);
  }

  console.group('➕ [Main Category] CREATE');
  console.log('URL    :', URL_MAIN_CATEGORY_CREATE);
  console.log('name   :', name);
  console.log('status :', status);
  console.log('image  :', image?.name || '(none)');
  console.groupEnd();

  const response = await fetch(URL_MAIN_CATEGORY_CREATE, {
    method: 'POST',
    // Do NOT set Content-Type — browser sets multipart boundary automatically
    body: fd,
  });

  const data = await handleResponse(response);
  console.log('✅ [Main Category] CREATE response:', data);
  return data;
};

// ── Fetch main categories + embedded sub-categories (web API) ─────────────────
// GET getMainCategories.php
// Response: { status, data: [{ id, name, sub_categories: [{ id, name }] }] }
export const fetchMainCategoriesWithSubsAction = async () => {
  const response = await fetch(URL_MAIN_CATEGORIES_WEB, { method: 'GET' });
  const data = await handleResponse(response);
  const list = Array.isArray(data.data) ? data.data : [];
  return list.map((cat) => ({
    id:   cat.id,
    name: cat.name || '',
    subs: Array.isArray(cat.sub_categories)
      ? cat.sub_categories.map((s) => ({ id: s.id, name: s.name || '' }))
      : [],
  }));
};
