import {
  DEFAULT_COUNTRY_OF_ORIGIN,
  DEFAULT_SIZE,
  PRODUCT_IMAGE_MIN,
  PRODUCT_IMAGE_MAX,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
  DISCOUNT_MIN,
  DISCOUNT_MAX,
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
  categoryId: '',   // "SMC-CATE-0001" — sent as category_id to backend
  categoryName: '',
  color: '',
  colorHex: '',
  material: '',
  pattern: '',
  character: '',
  gender: '',
  productClass: '',
  backpackStyle: '',
  bagCapacity: '',
  netQuantity: '',
  recommendedAge: '',
  size: DEFAULT_SIZE,
  countryOfOrigin: DEFAULT_COUNTRY_OF_ORIGIN,
  netWeight: '',
  price: '',
  stock: '',
  // Offers & Discount
  isOnOffer: false,
  isDiscounted: false,
  discountPercent: '',
  // Visibility — default "No Live"
  isLive: false,
  isPublished: false,
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
  // Keep File objects as-is — they'll be sent via FormData, not base64
  return images.map((img, index) => ({
    id: img.id,
    file: img.file || null,          // raw File object for FormData upload
    url: img.isExisting ? (img.url || img.preview) : null, // existing URL (edit mode)
    name: img.name || img.file?.name || `image-${index + 1}`,
    type: img.type || img.file?.type || 'image/jpeg',
    isPrimary: index === 0,
    isExisting: img.isExisting || false,
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
  return {
    productName: product.product_name || product.productName || product.name || '',
    genericName: product.generic_name || product.genericName || '',
    brand: product.brand || '',
    categoryId: String(product.category_id || product.categoryId || ''),
    categoryName: product.category_name || product.category || product.categoryName || '',
    color: product.color || '',
    colorHex: product.colorHex || product.color_hex || '',
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
    price: product.price ?? product.selling_price ?? '',
    stock: product.stock ?? '',
    // Offers & Discount
    isOnOffer: Boolean(product.is_on_offer ?? product.isOnOffer),
    isDiscounted: Boolean(product.is_discounted ?? product.isDiscounted),
    discountPercent: String(product.discount_percent ?? product.discountPercent ?? ''),
    // Visibility
    isLive: product.is_live === true || product.isLive === true,
    isPublished: product.status === 'published' || product.isPublished === true,
    images: mapStoredImagesToForm(product),
  };
}

function mapStoredImagesToForm(product) {
  if (product.images?.length) {
    return product.images.map((img, index) => {
      // API shape: { image_url: "uploads/products/...", is_main: true }
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
      };
    });
  }
  if (product.imageUrl || product.image_url) {
    const rawUrl = product.imageUrl || product.image_url;
    const fullUrl = resolveImageUrl(rawUrl);
    return [{
      id: 'existing-0',
      url: fullUrl,
      preview: fullUrl,
      name: 'product-image.jpg',
      type: 'image/jpeg',
      isPrimary: true,
      isExisting: true,
    }];
  }
  return [];
}

export function generateProductId() {
  return `PRD${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

export function resolveProductId(product) {
  if (!product) return null;
  // API returns numeric "id" as primary key
  return product.id ?? product.product_id ?? product.productId ?? null;
}

export function buildProductPayload(
  form,
  status,
  preparedImages = [],
  productId,
  categoryOptions = []
) {
  const id = productId || generateProductId();
  const primaryImage = preparedImages[0]?.url || '';
  const isPublished = status === 'published' && form.isPublished;
  const isLive = Boolean(form.isLive);
  const price = Number(form.price);
  const stock = form.stock !== '' && form.stock != null ? Number(form.stock) : 0;
  const category_id = form.categoryId ?? '';
  const category_name =
    form.categoryName ||
    getCategoryLabelById(categoryOptions, category_id) ||
    '';

  // Discount
  const isDiscounted = Boolean(form.isDiscounted);
  const discountPercent = isDiscounted && form.discountPercent !== ''
    ? Number(form.discountPercent)
    : null;

  return {
    product_id: id,
    productId: id,
    price,
    selling_price: price,
    mrp: price,
    product_price: price,
    stock,
    product_name: form.productName.trim(),
    productName: form.productName.trim(),
    name: form.productName.trim(),
    generic_name: form.genericName.trim(),
    genericName: form.genericName.trim(),
    brand: form.brand,
    category: category_name,
    category_name,
    category_id,
    categoryId: category_id,
    color: form.color,
    color_hex: form.colorHex,
    colorHex: form.colorHex,
    material: form.material,
    pattern: form.pattern,
    character: form.character,
    gender: form.gender,
    product_class: form.productClass,
    productClass: form.productClass,
    class: form.productClass,
    backpack_style: form.backpackStyle,
    backpackStyle: form.backpackStyle,
    bag_capacity: form.bagCapacity,
    bagCapacity: form.bagCapacity,
    net_quantity: form.netQuantity,
    netQuantity: form.netQuantity,
    recommended_age: form.recommendedAge,
    recommendedAge: form.recommendedAge,
    size: form.size.trim() || DEFAULT_SIZE,
    country_of_origin: form.countryOfOrigin.trim() || DEFAULT_COUNTRY_OF_ORIGIN,
    countryOfOrigin: form.countryOfOrigin.trim() || DEFAULT_COUNTRY_OF_ORIGIN,
    net_weight: form.netWeight,
    netWeight: form.netWeight,
    weight: form.netWeight,
    // Offers & Discount
    is_on_offer: form.isOnOffer ? 1 : 0,
    isOnOffer: Boolean(form.isOnOffer),
    is_discounted: isDiscounted ? 1 : 0,
    isDiscounted,
    discount_percent: discountPercent,
    discountPercent,
    // Visibility
    is_live: isLive ? 1 : 0,
    isLive,
    images: preparedImages,
    product_images: preparedImages,
    image_url: primaryImage,
    imageUrl: primaryImage,
    status,
    is_published: isPublished ? 1 : 0,
    isPublished,
    is_visible_on_website: isPublished ? 1 : 0,
    isVisibleOnWebsite: isPublished,
  };
}

const REQUIRED_PUBLISH_FIELDS = [
  { key: 'productName', label: 'Product Name' },
  { key: 'genericName', label: 'Generic Name' },
  { key: 'brand', label: 'Brand' },
  { key: 'categoryId', label: 'Category' },
  { key: 'color', label: 'Color' },
  { key: 'material', label: 'Material' },
  { key: 'gender', label: 'Gender' },
  { key: 'backpackStyle', label: 'Backpack Style' },
  { key: 'bagCapacity', label: 'Bag Capacity' },
  { key: 'netQuantity', label: 'Net Quantity' },
  { key: 'netWeight', label: 'Net Weight' },
  { key: 'recommendedAge', label: 'Recommended Age' },
  { key: 'price', label: 'Price' },
];

function validatePrice(form, errors) {
  const raw = form.price;
  if (raw === '' || raw === null || raw === undefined) {
    errors.price = 'Price is required';
    return;
  }
  const price = Number(raw);
  if (Number.isNaN(price) || price <= 0) {
    errors.price = 'Enter a valid price greater than 0';
  }
}

export function validateProductForm(form, mode = 'publish') {
  const errors = {};

  const imageError = validateImageFiles(form.images);
  if (imageError) {
    errors.images = imageError;
  }

  validatePrice(form, errors);

  if (mode === 'draft') {
    if (!form.productName?.trim()) {
      errors.productName = 'Product Name is required to save a draft';
    }
    return errors;
  }

  REQUIRED_PUBLISH_FIELDS.forEach(({ key, label }) => {
    const value = form[key];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors[key] = `${label} is required`;
    }
  });

  if (form.productName?.trim() && form.productName.trim().length < 3) {
    errors.productName = 'Product Name must be at least 3 characters';
  }

  if (form.genericName?.trim() && form.genericName.trim().length < 2) {
    errors.genericName = 'Generic Name must be at least 2 characters';
  }

  if (!form.colorHex) {
    errors.color = 'Please select a color';
  }

  if (form.recommendedAge?.trim()) {
    const agePattern = /^(\d+\s*(-|to)\s*\d+|\d+\+?|\d+\s*Years?)$/i;
    if (!agePattern.test(form.recommendedAge.trim())) {
      errors.recommendedAge = 'Use format like "5-12", "10+", or "6 Years"';
    }
  }

  // Publishing is now optional; visibility can be controlled via `isLive` toggle.

  return errors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
