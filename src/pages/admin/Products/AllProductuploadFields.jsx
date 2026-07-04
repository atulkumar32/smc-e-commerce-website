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
  categoryId: '',
  categoryName: '',
  selectedColors: [],
  customColor: '#000000',
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
  const isPublished = status === 'published';
  const isLive = Boolean(form.isLive);
  const mrp = Number(form.mrpPrice);
  const sellingPrice = Number(form.sellingPrice || mrp || 0);
  const stock = form.stock !== '' && form.stock != null ? Number(form.stock) : 0;
  const category_id = form.categoryId ?? '';
  const category_name =
    form.categoryName ||
    getCategoryLabelById(categoryOptions, category_id) ||
    '';

  const isDiscounted = Boolean(form.isDiscounted);
  const discountPercent = isDiscounted && form.discountPercent !== ''
    ? Number(form.discountPercent)
    : null;

  const selectedColors = form.selectedColors || [];
  const colorLabels = selectedColors.map((color) => color.label).join(', ');
  const colorHex = selectedColors[0]?.hex || form.colorHex || '';

  return {
    product_id: id,
    productId: id,
    price: sellingPrice,
    selling_price: sellingPrice,
    sellingPrice,
    mrp: mrp || sellingPrice,
    mrpPrice: mrp || sellingPrice,
    product_price: sellingPrice,
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
    color: colorLabels,
    color_hex: colorHex,
    colorHex: colorHex,
    selected_colors: JSON.stringify(selectedColors),
    material: form.material,
    pattern: form.pattern,
    character: form.character,
    character_name: form.character,   // PHP expects character_name
    gender: form.gender,
    class_type: form.productClass,    // PHP expects class_type
    product_class: form.productClass,
    productClass: form.productClass,
    class: form.productClass,
    backpack_style: form.backpackStyle,
    backpackStyle: form.backpackStyle,
    capacity: form.bagCapacity,       // PHP expects capacity
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
    actual_cost_price: form.actualCostPrice ? Number(form.actualCostPrice) : null,
    actualCostPrice: form.actualCostPrice ? Number(form.actualCostPrice) : null,
    // Features as JSON string
    features: form.features?.length ? JSON.stringify(form.features) : null,
    // Offers & Discount
    is_on_offer: form.isOnOffer ? 1 : 0,
    isOnOffer: Boolean(form.isOnOffer),
    is_discounted: isDiscounted ? 1 : 0,
    isDiscounted,
    discount_percent: discountPercent,
    discountPercent,
    discount_type: form.discountType,
    discountType: form.discountType,
    discount_value: form.discountValue ? Number(form.discountValue) : null,
    discountValue: form.discountValue ? Number(form.discountValue) : null,
    offer_title: form.offerTitle,
    offerTitle: form.offerTitle,
    offer_description: form.offerDescription,
    offerDescription: form.offerDescription,
    offer_start_date: form.offerStartDate,
    offerStartDate: form.offerStartDate,
    offer_end_date: form.offerEndDate,
    offerEndDate: form.offerEndDate,
    offer_active: form.offerActive ? 1 : 0,
    offerActive: Boolean(form.offerActive),
    short_description: form.shortDescription,
    shortDescription: form.shortDescription,
    full_description: form.fullDescription,
    fullDescription: form.fullDescription,
    homepage_banner_enabled: form.homepageBannerEnabled ? 1 : 0,
    homepageBannerEnabled: Boolean(form.homepageBannerEnabled),
    hero_banner_title: form.heroBannerTitle,
    heroBannerTitle: form.heroBannerTitle,
    hero_banner_subtitle: form.heroBannerSubtitle,
    heroBannerSubtitle: form.heroBannerSubtitle,
    hero_banner_cta: form.heroBannerCTA,
    heroBannerCTA: form.heroBannerCTA,
    hero_banner_url: form.heroBannerUrl,
    heroBannerUrl: form.heroBannerUrl,
    heroBannerDesktop: form.heroBannerDesktop,
    heroBannerMobile: form.heroBannerMobile,
    // Visibility
    is_live: isLive ? 1 : 0,
    isLive,
    is_new_arrival: form.isNewArrival ? 1 : 0,
    isNewArrival: Boolean(form.isNewArrival),
    show_in_card_slider: form.showInCardSlider ? 1 : 0,
    showInCardSlider: Boolean(form.showInCardSlider),
    images: preparedImages,
    product_images: preparedImages,
    image_url: primaryImage,
    imageUrl: primaryImage,
    status,
    is_published: isPublished ? 1 : 0,
    isPublished,
    is_visible_on_website: isLive ? 1 : 0,
    isVisibleOnWebsite: isLive,
  };
}

const REQUIRED_PUBLISH_FIELDS = [
  { key: 'productName', label: 'Product Name' },
  { key: 'brand', label: 'Brand' },
  { key: 'categoryId', label: 'Category' },
  { key: 'images', label: 'Product Images' },
  { key: 'mrpPrice', label: 'MRP Price' },
  { key: 'sellingPrice', label: 'Selling Price' },
  { key: 'stock', label: 'Stock Quantity' },
  { key: 'fullDescription', label: 'Full Description' },
];

function validatePrice(form, errors) {
  const raw = form.sellingPrice || form.price;
  if (raw === '' || raw === null || raw === undefined) {
    errors.sellingPrice = 'Selling price is required';
    return;
  }
  const price = Number(raw);
  if (Number.isNaN(price) || price <= 0) {
    errors.sellingPrice = 'Enter a valid selling price greater than 0';
  }
}

export function validateProductForm(form, mode = 'publish') {
  const errors = {};

  const imageError = validateImageFiles(form.images);
  if (imageError) {
    errors.images = imageError;
  }

  if (mode !== 'draft') {
    validatePrice(form, errors);
  }

  if (mode === 'draft') {
    return errors;
  }

  REQUIRED_PUBLISH_FIELDS.forEach(({ key, label }) => {
    const value = form[key];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors[key] = `${label} is required`;
    }
  });

  if (!form.selectedColors || form.selectedColors.length === 0) {
    errors.selectedColors = 'Select at least one color to publish';
  }

  if (!form.fullDescription || !String(form.fullDescription).trim()) {
    errors.fullDescription = 'Full Description is required to publish';
  }

  if (form.mrpPrice === '' || form.mrpPrice == null) {
    errors.mrpPrice = 'MRP Price is required';
  } else if (Number.isNaN(Number(form.mrpPrice)) || Number(form.mrpPrice) <= 0) {
    errors.mrpPrice = 'Enter a valid MRP price';
  }

  if (form.stock === '' || form.stock == null) {
    errors.stock = 'Stock quantity is required';
  } else if (Number.isNaN(Number(form.stock)) || Number(form.stock) < 1) {
    errors.stock = 'Enter a valid stock quantity (minimum 1)';
  }

  // if (form.netQuantity !== undefined && form.netQuantity !== '' && form.netQuantity != null) {
  //   if (Number.isNaN(Number(form.netQuantity)) || Number(form.netQuantity) < 1) {
  //     errors.netQuantity = 'Net quantity must be a positive number (minimum 1)';
  //   }
  // }

  if (form.discountPercent !== '' && form.discountPercent != null) {
    const pct = Number(form.discountPercent);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      errors.discountPercent = 'Discount percentage must be between 0 and 100';
    }
  }

  return errors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
