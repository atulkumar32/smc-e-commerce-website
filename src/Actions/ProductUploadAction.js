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

  // Only send the canonical backend keys.
  // Backend expects single (non-duplicate) keys; UI payload currently contains many aliases.
  // If an alias key exists, prefer the canonical one.
  const CANONICAL_KEYS = new Set([
    // identifiers
    'product_id',
    'productId',
    'category_id',
    'categoryId',

    // pricing
    'price',
    'selling_price',
    'sellingPrice',
    'mrp',
    'mrpPrice',
    'product_price',

    // stock
    'stock',
    'net_quantity',
    'netQuantity',
    'net_weight',
    'netWeight',
    'weight',

    // product basic
    'product_name',
    'productName',
    'generic_name',
    'genericName',
    'brand',

    // colors
    'color',
    'color_hex',
    'colorHex',
    'selected_colors',
    'features',

    // attributes
    'material',
    'pattern',
    'character',
    'character_name',
    'gender',
    'product_class',
    'productClass',
    'class',
    'class_type',
    'backpack_style',
    'backpackStyle',
    'bag_capacity',
    'bagCapacity',
    'capacity',
    'recommended_age',
    'recommendedAge',
    'size',
    'country_of_origin',
    'countryOfOrigin',
    'actual_cost_price',
    'actualCostPrice',

    // offers & discount
    'is_on_offer',
    'isOnOffer',
    'is_discounted',
    'isDiscounted',
    'discount_percent',
    'discountPercent',
    'discount_type',
    'discountType',
    'discount_value',
    'discountValue',
    'offer_title',
    'offerTitle',
    'offer_description',
    'offerDescription',
    'offer_start_date',
    'offerStartDate',
    'offer_end_date',
    'offerEndDate',
    'offer_active',
    'offerActive',

    // descriptions
    'short_description',
    'shortDescription',
    'full_description',
    'fullDescription',

    // homepage
    'homepage_banner_enabled',
    'homepageBannerEnabled',
    'hero_banner_title',
    'heroBannerTitle',
    'hero_banner_subtitle',
    'heroBannerSubtitle',
    'hero_banner_cta',
    'heroBannerCTA',
    'hero_banner_url',
    'heroBannerUrl',
    'heroBannerDesktop',
    'heroBannerMobile',

    // visibility/status
    'is_live',
    'isLive',
    'is_new_arrival',
    'isNewArrival',
    'show_in_card_slider',
    'showInCardSlider',
    'status',
    'is_published',
    'isPublished',
    'is_visible_on_website',
    'isVisibleOnWebsite',

    // images (handled separately)
    'image_url',
    'imageUrl',
  ]);

  // Backend allowed keys (see PHP $allowed array).
  // Keep only these from FormData so no extra aliases/unused fields are posted.
  const BACKEND_ALLOWED = new Set([
    // identifiers
    'product_id',
    // product basic
    'product_name',
    'generic_name',
    'brand',
    'category_id',
    // attributes
    'color',
    'color_hex',
    'selected_colors',
    'material',
    'pattern',
    'character',
    'character_name',
    'gender',
    'class_type',
    'backpack_style',
    'capacity',
    'net_quantity',
    'recommended_age',
    'size',
    'country_of_origin',
    'net_weight',
    'actual_cost_price',
    // pricing
    'price',
    'selling_price',
    'mrp',
    'discount_price',
    'discount_percent',
    'discount_value',
    'discount_type',
    // stock
    'stock',
    // features (JSON)
    'features',
    // descriptions
    'description',
    'short_description',
    'full_description',
    // offers
    'offer_title',
    'offer_description',
    'offer_start_date',
    'offer_end_date',
    'offer_active',
    'is_on_offer',
    'is_discounted',
    // homepage
    'homepage_banner_enabled',
    'hero_banner_title',
    'hero_banner_subtitle',
    'hero_banner_cta',
    'hero_banner_url',
    'hero_banner_desktop',
    'hero_banner_mobile',
    // visibility
    'is_live',
    'is_published',
    'is_visible_on_website',
    'is_new_arrival',
    'show_in_card_slider',
    // status
    'status',
    // images handled separately
    'image_url',
  ]);



  const DUPLICATE_ALIAS_GROUPS = [
    // category
    ['category_id', 'categoryId'],
    // pricing
    ['selling_price', 'sellingPrice'],
    ['mrp', 'mrpPrice'],
    // identifiers / product
    ['product_id', 'productId'],
    // text aliases
    ['product_name', 'productName'],
    ['generic_name', 'genericName'],
    ['character_name', 'character'],
    ['class_type', 'productClass'],
    ['capacity', 'bagCapacity'],
    ['color_hex', 'colorHex'],
    ['net_quantity', 'netQuantity'],
    ['net_weight', 'netWeight'],
    ['actual_cost_price', 'actualCostPrice'],
    // offers
    ['is_on_offer', 'isOnOffer'],
    ['is_discounted', 'isDiscounted'],
    ['discount_percent', 'discountPercent'],
    ['discount_type', 'discountType'],
    ['discount_value', 'discountValue'],
    ['offer_title', 'offerTitle'],
    ['offer_description', 'offerDescription'],
    ['offer_start_date', 'offerStartDate'],
    ['offer_end_date', 'offerEndDate'],
    ['offer_active', 'offerActive'],
    // descriptions
    ['short_description', 'shortDescription'],
    ['full_description', 'fullDescription'],
    // homepage
    ['homepage_banner_enabled', 'homepageBannerEnabled'],
    ['hero_banner_title', 'heroBannerTitle'],
    ['hero_banner_subtitle', 'heroBannerSubtitle'],
    ['hero_banner_cta', 'heroBannerCTA'],
    ['hero_banner_url', 'heroBannerUrl'],
    // visibility
    ['is_live', 'isLive'],
    ['is_new_arrival', 'isNewArrival'],
    ['show_in_card_slider', 'showInCardSlider'],
    ['is_published', 'isPublished'],
    ['is_visible_on_website', 'isVisibleOnWebsite'],
    // images
    ['image_url', 'imageUrl'],
  ];

  // Determine which alias to keep: prefer snake_case for backend compatibility.
  const shouldSendKey = (key) => {
    if (!CANONICAL_KEYS.has(key)) return false;

    for (const group of DUPLICATE_ALIAS_GROUPS) {
      if (group.includes(key)) {
        const preferred = group.find((k) => k.includes('_')) || group[0];
        return key === preferred;
      }
    }

    return true;
  };

  // Only send keys that backend accepts (PHP $allowed).
  // This prevents extra fields like aliases from being posted.
  const shouldSendBackendKey = (key) => BACKEND_ALLOWED.has(key);

  // ── Scalar fields ────────────────────────────────────────────────────────────
  Object.entries(fields).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (!shouldSendKey(key)) return;
    if (!shouldSendBackendKey(key)) return;


    if (value instanceof File) {
      fd.append(key, value, value.name);
      return;
    }

    if (typeof value === 'object') {
      if (value?.file instanceof File) {
        fd.append(key, value.file, value.name || value.file.name);
        return;
      }
      fd.append(key, JSON.stringify(value));
      return;
    }

    fd.append(key, String(value));
  });


  // ── Image files ──────────────────────────────────────────────────────────────
  const imgs = images || product_images || [];
  imgs.forEach((img, index) => {
    if (img.file instanceof File) {
      fd.append(`images[${index}]`, img.file, img.name || img.file.name);
    } else if (img.url && img.isExisting) {
      fd.append(`existing_images[${index}]`, img.url);
    }
    // Attach color metadata alongside each image
    if (img.color_label) {
      fd.append(`image_color_label[${index}]`, img.color_label);
    }
    if (img.color_hex) {
      fd.append(`image_color_hex[${index}]`, img.color_hex);
    }
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
