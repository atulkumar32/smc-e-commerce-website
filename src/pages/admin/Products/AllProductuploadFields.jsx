import {
  DEFAULT_COUNTRY_OF_ORIGIN,
  DEFAULT_SIZE,
  PRODUCT_IMAGE_MIN,
  PRODUCT_IMAGE_MAX,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
} from './Components/AddNewProduct/AddNewProductData';

import { MEDIA_BASE } from '../../../Config/UrlsConfig';

// Resolve a relative image path from the API to a full URL
function resolveImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // API returns e.g. "uploads/products/filename.png" → prepend media base
  return `${MEDIA_BASE}${path}`;
}

// Resolve category label from the live categories list loaded from DB
function getCategoryLabelById(categoryOptions = [], categoryId) {
  return categoryOptions.find((c) => String(c.value) === String(categoryId))?.label || '';
}

export const emptyProductForm = {
  productName: '',
  genericName: '',
  brand: '',
  categoryId: '',
  categoryName: '',
  gst: '',
  gender: '',
  material: '',
  pattern: '',
  character: '',
  productClass: '',
  backpackStyle: '',
  bagCapacity: '',
  netQuantity: '',
  recommendedAge: '',
  size: DEFAULT_SIZE,
  countryOfOrigin: DEFAULT_COUNTRY_OF_ORIGIN,
  netWeight: '',
  mrpPrice: '',
  sellingPrice: '',
  discountPercent: '',
  actualCostPrice: '',
  stock: '',
  // Offers & Discount
  isOnOffer: false,
  isDiscounted: false,
  discountType: 'percentage',
  discountValue: '',
  offerTitle: '',
  offerDescription: '',
  offerStartDate: '',
  offerEndDate: '',
  offerActive: false,
  // Description
  shortDescription: '',
  fullDescription: '',
  // Homepage banner
  homepageBannerEnabled: false,
  heroBannerDesktop: null,
  heroBannerMobile: null,
  heroBannerTitle: '',
  heroBannerSubtitle: '',
  heroBannerCTA: '',
  heroBannerUrl: '',
  // Visibility — default "No Live"
  isLive: false,
  isNewArrival: false,
  showInCardSlider: false,
  isPublished: false,
  isVisibleOnWebsite: false,
  images: [],
};

export function isValidImageType(file) {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return (
    ALLOWED_IMAGE_TYPES.includes(file.type) ||
    ALLOWED_IMAGE_EXTENSIONS.includes(ext)
  );
}

export function validateImageFile(file) {
  if (!isValidImageType(file)) {
    return 'Only JPG, JPEG, and PNG images are allowed';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`;
  }
  return null;
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function prepareImagesForPayload(images = []) {
  return images.map((img, index) => ({
    id: img.id,
    file: img.file || null,
    url: img.isExisting ? (img.url || img.preview) : null,
    name: img.name || img.file?.name || `image-${index + 1}`,
    type: img.type || img.file?.type || 'image/jpeg',
    isPrimary: index === 0,
    isExisting: img.isExisting || false,
    // Color association — which product color this image represents
    color_label: img.colorLabel || '',
    color_hex:   img.colorHex   || '',
  }));
}

export function validateImageFiles(images = []) {
  if (!images || images.length < PRODUCT_IMAGE_MIN) {
    return `Upload at least ${PRODUCT_IMAGE_MIN} product image (JPG, JPEG, or PNG)`;
  }
  if (images.length > PRODUCT_IMAGE_MAX) {
    return `Maximum ${PRODUCT_IMAGE_MAX} images allowed`;
  }
  for (const img of images) {
    if (img.file) {
      const fileError = validateImageFile(img.file);
      if (fileError) return fileError;
    }
  }
  return '';
}

export function mapProductToForm(product = {}) {
  const existingColors = Array.isArray(product.selectedColors)
    ? product.selectedColors
    : product.color
      ? [{ label: product.color, hex: product.colorHex || product.color_hex || '#000000' }]
      : [];

  return {
    productName: product.product_name || product.productName || product.name || '',
    genericName: product.generic_name || product.genericName || product.name || '',
    brand: product.brand || '',
    categoryId: String(product.category_id || product.categoryId || ''),
    categoryName: product.category_name || product.category || product.categoryName || '',
    selectedColors: existingColors,
    customColor: '#000000',
    material: product.material || '',
    pattern: product.pattern || '',
    character: product.character_name || product.character || '',
    gender: product.gender || '',
    productClass: product.class_type || product.productClass || product.class || '',
    backpackStyle: product.backpack_style || product.backpackStyle || '',
    bagCapacity: product.capacity || product.bagCapacity || product.bag_capacity || '',
    netQuantity: String(product.net_quantity ?? product.netQuantity ?? ''),
    recommendedAge: product.recommended_age || product.recommendedAge || '',
    size: product.size || DEFAULT_SIZE,
    countryOfOrigin: product.country_of_origin || product.countryOfOrigin || DEFAULT_COUNTRY_OF_ORIGIN,
    netWeight: product.net_weight || product.netWeight || product.weight || '',
    mrpPrice: product.mrp ?? product.mrpPrice ?? product.price ?? '',
    sellingPrice: product.selling_price ?? product.sellingPrice ?? product.price ?? '',
    discountPercent: String(product.discount_percent ?? product.discountPercent ?? ''),
    actualCostPrice: product.actual_cost_price ?? product.actualCostPrice ?? '',
    stock: product.stock ?? '',
    // Offers & Discount
    isOnOffer: Boolean(product.is_on_offer ?? product.isOnOffer),
    isDiscounted: Boolean(product.is_discounted ?? product.isDiscounted),
    discountType: product.discount_type || product.discountType || 'percentage',
    discountValue: product.discount_value ?? product.discountValue ?? '',
    offerTitle: product.offer_title || product.offerTitle || '',
    offerDescription: product.offer_description || product.offerDescription || '',
    offerStartDate: product.offer_start_date || product.offerStartDate || '',
    offerEndDate: product.offer_end_date || product.offerEndDate || '',
    offerActive: Boolean(product.offer_active ?? product.offerActive),
    shortDescription: product.short_description || product.shortDescription || '',
    fullDescription: product.full_description || product.fullDescription || '',
    homepageBannerEnabled: Boolean(product.homepage_banner_enabled ?? product.homepageBannerEnabled),
    heroBannerDesktop: product.heroBannerDesktop || null,
    heroBannerMobile: product.heroBannerMobile || null,
    heroBannerTitle: product.heroBannerTitle || product.heroBanner_title || '',
    heroBannerSubtitle: product.heroBannerSubtitle || product.heroBanner_subtitle || '',
    heroBannerCTA: product.heroBannerCTA || product.heroBanner_cta || '',
    heroBannerUrl: product.heroBannerUrl || product.heroBanner_url || '',
    // Visibility
    isLive: product.is_live === true || product.isLive === true,
    isNewArrival: product.is_new_arrival === true || product.isNewArrival === true,
    showInCardSlider: product.show_in_card_slider === true || product.showInCardSlider === true,
    isPublished: product.status === 'published' || product.isPublished === true,
    images: mapStoredImagesToForm(product),
  };
}

function mapStoredImagesToForm(product) {
  if (product.images?.length) {
    return product.images.map((img, index) => {
      const rawUrl = img.image_url || img.url || img.preview || img.data || '';
      const fullUrl = resolveImageUrl(rawUrl);
      return {
        id: img.id || `existing-${index}`,
        url: fullUrl,
        preview: fullUrl,
        name: img.name || rawUrl.split('/').pop() || `image-${index + 1}.jpg`,
        type: img.type || 'image/jpeg',
        isPrimary: img.is_main === true || img.isPrimary === true || index === 0,
        isExisting: true,
        colorLabel: img.color_label || img.colorLabel || '',
        colorHex:   img.color_hex   || img.colorHex   || '',
      };
    });
  }
  if (product.imageUrl || product.image_url) {
    const rawUrl = product.imageUrl || product.image_url;
    const fullUrl = resolveImageUrl(rawUrl);
    return [{
      id: 'existing-0',
      url: fullUrl, preview: fullUrl,
      name: 'product-image.jpg', type: 'image/jpeg',
      isPrimary: true, isExisting: true,
      colorLabel: '', colorHex: '',
    }];
  }
  return [];
}

export function generateProductId() {
  return `PRD${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

export function resolveProductId(product) {
  if (!product) return null;
  // For UPDATE operations, the backend PHP reads product_id (the string "SMC-PROD-xxxx").
  // Prefer product_id string over numeric id to ensure correct record matching.
  // Falls back to numeric id if no string product_id exists.
  return (
    product.product_id  ??   // "SMC-PROD-0009" — what PHP UPDATE uses
    product.productId   ??   // camelCase alias
    product.id          ??   // numeric DB PK fallback
    null
  );
}

/**
 * buildProductPayload
 *
 * Builds the exact payload sent to the API from the AddNewProduct form.
 * Only fields present in the form UI are included.
 * Images are excluded here — handled separately via variants.
 *
 * Form fields covered:
 *   Basic Info    : product_name, generic_name, brand, category_id, gst, gender
 *   Attributes    : material, pattern, character_name, class_type, backpack_style,
 *                   capacity, net_quantity, net_weight, recommended_age, country_of_origin
 *   Features      : features (JSON array)
 *   Description   : short_description, full_description
 *   Visibility    : is_live, is_new_arrival, show_in_card_slider,
 *                   is_published, is_visible_on_website, homepage_banner_enabled
 *   Status        : status (draft | published)
 */
export function buildProductPayload(
  form,
  status,
  _preparedImages = [],   // ← images commented out for now
  productId,
  categoryOptions = []
) {
  const id          = productId || generateProductId();
  const isPublished = status === 'published';
  const isLive      = Boolean(form.isLive);

  const category_id   = form.categoryId ?? '';
  const category_name =
    form.categoryName ||
    getCategoryLabelById(categoryOptions, category_id) ||
    '';

  const payload = {
    // ── Identifiers ──────────────────────────────────────────
    product_id: id,

    // ── Basic Information ────────────────────────────────────
    product_name:    (form.productName  || '').trim(),
    generic_name:    (form.genericName  || '').trim(),
    brand:           form.brand         || '',
    category_id,
    category_name,
    gst:             form.gst           || '',
    gender:          form.gender        || '',

    // ── Product Attributes ───────────────────────────────────
    material:           form.material       || '',
    pattern:            form.pattern        || '',
    character_name:     form.character      || '',   // PHP key
    class_type:         form.productClass   || '',   // PHP key
    backpack_style:     form.backpackStyle  || '',
    capacity:           form.bagCapacity    || '',   // PHP key
    net_quantity:       form.netQuantity    || '',
    net_weight:         form.netWeight      || '',
    recommended_age:    form.recommendedAge || '',
    country_of_origin:  (form.countryOfOrigin || DEFAULT_COUNTRY_OF_ORIGIN).trim(),

    // ── Features (JSON array string) ─────────────────────────
    features: Array.isArray(form.features) && form.features.length
      ? JSON.stringify(form.features)
      : '',

    // ── Descriptions ─────────────────────────────────────────
    short_description: form.shortDescription || '',
    full_description:  form.fullDescription  || '',

    // ── Visibility & Status ───────────────────────────────────
    is_live:               isLive      ? 1 : 0,
    is_new_arrival:        form.isNewArrival        ? 1 : 0,
    show_in_card_slider:   form.showInCardSlider     ? 1 : 0,
    is_published:          isPublished  ? 1 : 0,
    is_visible_on_website: form.isVisibleOnWebsite   ? 1 : 0,
    homepage_banner_enabled: form.homepageBannerEnabled ? 1 : 0,
    status,

    // ── Images — commented out: handled via product variants ─
    // images: preparedImages,
    // image_url: preparedImages[0]?.url || '',
  };

  return payload;
}

export function validateProductForm(form, mode = 'publish') {
  const errors = {};

  // Only validate the bare minimum — product name, brand, category
  if (!form.productName || !String(form.productName).trim()) {
    errors.productName = 'Product Name is required';
  }

  if (!form.brand || !String(form.brand).trim()) {
    errors.brand = 'Brand is required';
  }

  if (!form.categoryId || !String(form.categoryId).trim()) {
    errors.categoryId = 'Category is required';
  }

  // All other fields (mrp, selling price, stock, images, colors) are optional —
  // variants handle pricing/stock, images can be added separately.
  return errors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
