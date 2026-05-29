/**
 * ProductUploadAction.js
 *
 * All API calls related to products.
 * Images are sent as real file uploads via multipart/form-data.
 *
 *  GET    GetProducts.php     → fetchProductsAction
 *  POST   CreateProducts.php  → createProductAction   (multipart/form-data)
 *  POST   UpdateProducts.php  → updateProductAction   (multipart/form-data)
 *  POST   DeleteProducts.php  → deleteProductAction   (JSON)
 */

import {
  URL_PRODUCTS_FETCH,
  URL_PRODUCTS_CREATE,
  URL_PRODUCTS_UPDATE,
  URL_PRODUCTS_DELETE,
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

// ── Build FormData from payload ────────────────────────────────────────────────
// Appends all scalar fields as text, and image File objects as file fields.
// images array items: { file: File|null, url: string|null, isPrimary, isExisting, name }
function buildFormData(payload) {
  const fd = new FormData();
  const { images, product_images, ...fields } = payload;

  // ── Scalar fields ────────────────────────────────────────────────────────────
  Object.entries(fields).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    fd.append(key, String(value));
  });

  // ── Image files ──────────────────────────────────────────────────────────────
  const imgs = images || product_images || [];
  imgs.forEach((img, index) => {
    if (img.file instanceof File) {
      // New file upload — send as images[] or images[0], images[1], etc.
      fd.append(`images[${index}]`, img.file, img.name || img.file.name);
    } else if (img.url && img.isExisting) {
      // Existing image — send URL as text so backend keeps it
      fd.append(`existing_images[${index}]`, img.url);
    }
    // Mark primary image index
    if (img.isPrimary) {
      fd.append('primary_image_index', String(index));
    }
  });

  return fd;
}

// ── Fetch all products ─────────────────────────────────────────────────────────
export const fetchProductsAction = async () => {
  const response = await fetch(URL_PRODUCTS_FETCH, {
    method: 'GET',
  });

  return handleResponse(response);
};

// ── Create a new product ───────────────────────────────────────────────────────
export const createProductAction = async (payload) => {
  // Strip id fields — backend treats absence of id as new record
  const { id, product_id, productId, ...createPayload } = payload;

  const fd = buildFormData(createPayload);

  const response = await fetch(URL_PRODUCTS_CREATE, {
    method: 'POST',
    // Do NOT set Content-Type — browser sets it automatically with boundary for multipart
    body: fd,
  });

  return handleResponse(response);
};

// ── Update an existing product ─────────────────────────────────────────────────
export const updateProductAction = async (id, payload) => {
  const updatePayload = {
    ...payload,
    id,
    category_id: payload.category_id ?? null,
  };

  const fd = buildFormData(updatePayload);

  const response = await fetch(URL_PRODUCTS_UPDATE, {
    method: 'POST',
    body: fd,
  });

  return handleResponse(response);
};

// ── Delete a product ───────────────────────────────────────────────────────────
// curl: POST with { "id": 3 } in JSON body
export const deleteProductAction = async (id) => {
  const response = await fetch(URL_PRODUCTS_DELETE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  return handleResponse(response);
};
