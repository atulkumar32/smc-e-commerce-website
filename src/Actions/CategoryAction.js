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

// ── Fetch all categories from DB ───────────────────────────────────────────────
export const fetchCategoriesAction = async () => {
  console.log('📡 [Category] GET', URL_CATEGORIES_FETCH);

  const response = await fetch(URL_CATEGORIES_FETCH, { method: 'GET' });
  const data = await handleResponse(response);

  console.log('✅ [Category] FETCH response:', data);

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data.categories) ? data.categories
    : Array.isArray(data.data)       ? data.data
    : [];

  return list.map((cat) => ({
    value:       cat.id,
    label:       cat.name ?? cat.category_name ?? '',
    id:          cat.id,
    category_id: cat.category_id,
    description: cat.description ?? '',
    raw:         cat,
  }));
};

// ── Create a new category ──────────────────────────────────────────────────────
export const createCategoryAction = async (payloadOrName, description = '') => {
  const body =
    typeof payloadOrName === 'object' && payloadOrName !== null
      ? payloadOrName
      : { category_name: payloadOrName, description };

  console.group('➕ [Category] CREATE');
  console.log('URL    :', URL_CATEGORIES_CREATE);
  console.log('payload:', JSON.stringify(body));
  console.groupEnd();

  const response = await fetch(URL_CATEGORIES_CREATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await handleResponse(response);
  console.log('✅ [Category] CREATE response:', data);
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
