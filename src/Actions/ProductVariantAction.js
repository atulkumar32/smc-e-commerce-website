/**
 * ProductVariantAction.js
 *
 * Bulk create:  POST JSON  → CreateProductVariantsBulk.php
 *               { product_id, variants: [{ color_name, color_hex, size, mrp, selling_price, stock, ... }] }
 *
 * Single ops:   FormData   → CreateProductVariant / UpdateProductVariant
 * Delete:       JSON       → DeleteProductVariant
 * Fetch:        GET        → GetProductVariants?product_id=XXX
 */

import {
  URL_VARIANTS_CREATE,
  URL_VARIANTS_CREATE_BULK,
  URL_VARIANTS_UPDATE,
  URL_VARIANTS_DELETE,
  URL_VARIANTS_FETCH,
} from '../Config/UrlsConfig';

// ── Response handler ──────────────────────────────────────────────────────────
async function handleResponse(res) {
  let data = {};
  try {
    const text = await res.text();
    console.log('[Variants] Raw response:', text.slice(0, 500));
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.warn('[Variants] Failed to parse JSON:', e.message);
  }
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status} ${res.statusText}`);
  if (data.status === false) throw new Error(data.message || 'Server returned status: false');
  return data;
}

// ── FormData builder ──────────────────────────────────────────────────────────
function buildVariantFormData(payload, images = []) {
  const fd = new FormData();

  const SCALAR_FIELDS = [
    'product_id', 'variant_id', 'color_name', 'color_hex',
    'size', 'material', 'mrp', 'selling_price', 'discount_price',
    'stock', 'status', 'is_default',
  ];

  SCALAR_FIELDS.forEach((key) => {
    const val = payload[key];
    if (val !== undefined && val !== null && val !== '') {
      fd.append(key, String(val));
    }
  });

  let primarySet = false;
  images.forEach((img, index) => {
    if (img.file instanceof File) {
      fd.append('images[]', img.file, img.file.name);
      if (!primarySet) {
        fd.append('primary_image_index', String(index));
        primarySet = true;
      }
    } else if (img.url && img.isExisting) {
      fd.append(`existing_images[${index}]`, img.url);
    }
  });

  // Debug: log all FormData entries
  console.group('📦 [Variants] FormData contents');
  for (const [key, val] of fd.entries()) {
    if (val instanceof File) {
      console.log(`  ${key}:`, `File(${val.name}, ${val.size}b)`);
    } else {
      console.log(`  ${key}:`, val);
    }
  }
  console.groupEnd();

  return fd;
}

// ── Fetch variants ─────────────────────────────────────────────────────────────
export const fetchVariantsAction = async (productId) => {
  const url = `${URL_VARIANTS_FETCH}?product_id=${encodeURIComponent(productId)}`;
  console.log('[Variants] 🔍 GET', url);
  try {
    const res  = await fetch(url);
    const text = await res.text();
    console.log('[Variants] Raw response:', text.slice(0, 300));

    // Guard against PHP fatal error HTML responses
    if (!res.ok || text.trim().startsWith('<')) {
      console.warn('[Variants] Server returned non-JSON (possible PHP error) — returning []');
      return [];
    }

    let data = {};
    try { data = JSON.parse(text); } catch {
      console.warn('[Variants] JSON parse failed — returning []');
      return [];
    }

    const list = Array.isArray(data) ? data
      : Array.isArray(data?.variants) ? data.variants
      : Array.isArray(data?.data)     ? data.data : [];

    console.log(`[Variants] 🔍 Loaded ${list.length} variant(s)`);
    return list;
  } catch (err) {
    console.warn('[Variants] Fetch failed:', err.message, '— returning []');
    return [];
  }
};

// ── Bulk create ────────────────────────────────────────────────────────────────
export const createVariantsBulkAction = async (productId, variants) => {
  // Guard — ensure variants is a non-empty array
  if (!Array.isArray(variants) || variants.length === 0) {
    console.warn('[Variants Bulk] No variants to save — aborting');
    throw new Error('No variants to save. Add at least one variant to the list first.');
  }

  // Build clean variant objects — no material, no is_default
  const cleanVariants = variants.map((v) => ({
    color_name:     v.color_name,
    color_hex:      v.color_hex,
    size:           v.size,
    mrp:            Number(v.mrp),
    selling_price:  Number(v.selling_price),
    discount_price: Number(v.discount_price) || Number(v.selling_price),
    stock:          Number(v.stock),
    status:         v.status || 'active',
  }));

  // Use FormData so we can attach images alongside the JSON variants
  const fd = new FormData();
  fd.append('product_id', productId);
  fd.append('variants', JSON.stringify(cleanVariants));

  // Attach images per variant: images[0][], images[1][], etc.
  variants.forEach((v, idx) => {
    const imgs = Array.isArray(v.images) ? v.images : [];
    imgs.forEach((img) => {
      if (img.file instanceof File) {
        fd.append(`images[${idx}][]`, img.file, img.file.name);
      }
    });
    // primary image index for this variant
    const primaryIdx = imgs.findIndex((i) => i.file instanceof File);
    if (primaryIdx >= 0) {
      fd.append(`primary_image_index[${idx}]`, String(primaryIdx));
    }
  });

  // ── Console debug ──────────────────────────────────────────────────────────
  console.group('📦 [Variants Bulk] CREATE REQUEST');
  console.log('URL          :', URL_VARIANTS_CREATE_BULK);
  console.log('product_id   :', productId);
  console.log('variant count:', cleanVariants.length);
  cleanVariants.forEach((v, i) => {
    const imgCount = Array.isArray(variants[i]?.images)
      ? variants[i].images.filter((im) => im.file instanceof File).length : 0;
    console.group(`  variant[${i}]`);
    console.log('color      :', v.color_name, v.color_hex);
    console.log('size       :', v.size);
    console.log('mrp        :', v.mrp, '| selling:', v.selling_price, '| discount:', v.discount_price);
    console.log('stock      :', v.stock, '| status:', v.status);
    console.log('images     :', imgCount, 'file(s)');
    console.groupEnd();
  });
  console.log('variants JSON:', JSON.stringify(cleanVariants, null, 2));

  // Log all FormData entries
  console.group('  FormData entries');
  for (const [key, val] of fd.entries()) {
    if (val instanceof File) {
      console.log(`  ${key}:`, `File(${val.name}, ${val.size}b, ${val.type})`);
    } else {
      console.log(`  ${key}:`, val.length > 200 ? val.slice(0, 200) + '…' : val);
    }
  }
  console.groupEnd();
  console.groupEnd();

  const res = await fetch(URL_VARIANTS_CREATE_BULK, {
    method: 'POST',
    body: fd, // No Content-Type header — browser sets multipart boundary automatically
  });

  const data = await handleResponse(res);
  console.group('✅ [Variants Bulk] RESPONSE');
  console.log('status  :', data.status);
  console.log('message :', data.message);
  console.log('variants:', data.variants);
  console.log('full    :', data);
  console.groupEnd();
  return data;
};

// ── Single create ──────────────────────────────────────────────────────────────
export const createVariantAction = async (payload, images = []) => {
  console.group('[Variants] ➕ CREATE single');
  console.log('product_id:', payload.product_id);
  console.log('color:', payload.color_name, payload.color_hex);
  console.log('size:', payload.size, '| mrp:', payload.mrp, '| selling:', payload.selling_price);
  const fd = buildVariantFormData(payload, images);
  console.groupEnd();
  const res = await fetch(URL_VARIANTS_CREATE, { method: 'POST', body: fd });
  const data = await handleResponse(res);
  console.log('[Variants] ➕ CREATE response:', data);
  return data;
};

// ── Update variant ─────────────────────────────────────────────────────────────
export const updateVariantAction = async (variantId, payload, images = []) => {
  console.group('[Variants] ✏️ UPDATE', variantId);
  console.log('payload:', payload);
  const fd = buildVariantFormData({ ...payload, variant_id: variantId }, images);
  console.groupEnd();
  const res = await fetch(URL_VARIANTS_UPDATE, { method: 'POST', body: fd });
  const data = await handleResponse(res);
  console.log('[Variants] ✏️ UPDATE response:', data);
  return data;
};

// ── Delete variant ─────────────────────────────────────────────────────────────
export const deleteVariantAction = async (variantId) => {
  console.log('[Variants] 🗑️ DELETE', variantId);
  const res = await fetch(URL_VARIANTS_DELETE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variant_id: variantId }),
  });
  const data = await handleResponse(res);
  console.log('[Variants] 🗑️ DELETE response:', data);
  return data;
};
