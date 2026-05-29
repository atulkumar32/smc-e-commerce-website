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
  const response = await fetch(URL_CATEGORIES_FETCH, {
    method: 'GET',
  });

  const data = await handleResponse(response);

  // API returns: { "categories": [{ id, category_id, name, description, ... }] }
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data.categories)
    ? data.categories
    : Array.isArray(data.data)
    ? data.data
    : [];

  return list.map((cat) => ({
    value: cat.id,                                    // numeric 1 — used as category_id in product payload
    label: cat.name ?? cat.category_name ?? '',       // "dfghjkl"
    id: cat.id,                                       // numeric 1
    category_id: cat.category_id,                     // "SMC-CATE-0001"
    description: cat.description ?? '',
    raw: cat,
  }));
};

// ── Create a new category ──────────────────────────────────────────────────────
// Accepts either a plain object payload or (categoryName, description) strings
export const createCategoryAction = async (payloadOrName, description = '') => {
  const body =
    typeof payloadOrName === 'object' && payloadOrName !== null
      ? payloadOrName                                          // already { category_name, description }
      : { category_name: payloadOrName, description };        // called with strings

  const response = await fetch(URL_CATEGORIES_CREATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
};

// ── Update a category ──────────────────────────────────────────────────────────
// editingCategory: the raw category object from the list
// payload: { category_name, description } built by buildCategoryApiPayload
export const updateCategoryAction = async (editingCategory, payload) => {
  const body = {
    ...payload,
    id: editingCategory?.id ?? null,
    category_id: editingCategory?.category_id ?? editingCategory?.id ?? null,
  };

  const response = await fetch(URL_CATEGORIES_UPDATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
};

// ── Delete a category ──────────────────────────────────────────────────────────
export const deleteCategoryAction = async (categoryId) => {
  const response = await fetch(URL_CATEGORIES_DELETE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category_id: categoryId }),
  });

  return handleResponse(response);
};
