import { MEDIA_BASE } from '../../../Config/UrlsConfig';

/**
 * Image resolver for admin products & variants.
 * Handles relative backend paths like "uploads/products/image.jpeg"
 * as well as full URLs, encoding only the filename component safely.
 */
export const resolveImg = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const segments = path.replace(/^\/+/, '').split('/');
  const filename = segments[segments.length - 1];
  const dirPart = segments.slice(0, -1).join('/');
  const encoded = dirPart
    ? `${dirPart}/${encodeURIComponent(filename)}`
    : encodeURIComponent(filename);
  return `${MEDIA_BASE}${encoded}`;
};

/**
 * Extract canonical display ID
 */
export const getDisplayId = (r) => r?.product_id || r?.productId || r?.id || '—';

/**
 * Extract canonical display name
 */
export const getDisplayName = (r) => r?.product_name || r?.productName || r?.name || '—';

/**
 * Extract canonical category name
 */
export const getCategoryName = (r) => r?.category_name || r?.category || 'General';

/**
 * Extract best selling price: Checks product level price or first variant's selling price
 */
export const getBestPriceNumber = (r) => {
  const pPrice =
    Number(r?.discount_price) ||
    Number(r?.selling_price) ||
    Number(r?.price) ||
    Number(r?.mrp) ||
    0;
  if (pPrice > 0) return pPrice;
  const firstVar = Array.isArray(r?.variants) && r.variants[0];
  return firstVar
    ? Number(firstVar.discount_price) ||
        Number(firstVar.selling_price) ||
        Number(firstVar.mrp) ||
        0
    : 0;
};

export const getBestPrice = (r) => {
  const price = getBestPriceNumber(r);
  return price > 0 ? `₹${price.toLocaleString('en-IN')}` : '—';
};

/**
 * Extract MRP
 */
export const getMRPNumber = (r) => {
  const mrp = Number(r?.mrp) || Number(r?.price) || 0;
  if (mrp > 0) return mrp;
  const firstVar = Array.isArray(r?.variants) && r.variants[0];
  return firstVar ? Number(firstVar.mrp) || 0 : 0;
};

export const getMRP = (r) => {
  const v = getMRPNumber(r);
  return v > 0 ? `₹${v.toLocaleString('en-IN')}` : null;
};

/**
 * Calculate total stock across all variants or product level
 */
export const getTotalStock = (r) => {
  if (Array.isArray(r?.variants) && r.variants.length > 0) {
    return r.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
  }
  return Number(r?.stock ?? 0);
};

/**
 * Stock health status
 * - 'out_of_stock': stock === 0
 * - 'low_stock': stock > 0 && stock <= 10
 * - 'in_stock': stock > 10
 */
export const getStockStatus = (stockCount) => {
  if (stockCount <= 0) return { label: 'Out of Stock', color: 'error', bg: '#fef2f2', text: '#dc2626' };
  if (stockCount <= 10) return { label: 'Low Stock', color: 'warning', bg: '#fffbeb', text: '#d97706' };
  return { label: 'In Stock', color: 'success', bg: '#ecfdf5', text: '#059669' };
};

/**
 * Safe JSON parser
 */
export const parseJson = (val) => {
  if (!val) return null;
  if (Array.isArray(val)) return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
};

/**
 * Normalize flag boolean from API (accepts 1, '1', true)
 */
export const flag = (v) => v === 1 || v === '1' || v === true;

/**
 * Extract best thumbnail for product table
 */
export const getProductThumb = (r) => {
  if (Array.isArray(r?.variants)) {
    for (const v of r.variants) {
      if (Array.isArray(v.images) && v.images.length) {
        const main = v.images.find((i) => i.is_main) || v.images[0];
        if (main?.image_url) return resolveImg(main.image_url);
      }
    }
  }
  if (r?.primary_image) return resolveImg(r.primary_image);
  if (r?.image_url) return resolveImg(r.image_url);
  if (r?.imageUrl) return resolveImg(r.imageUrl);
  if (r?.image) return resolveImg(r.image);
  if (Array.isArray(r?.product_images) && r.product_images.length) {
    const main = r.product_images.find((i) => i.is_main || i.isPrimary) || r.product_images[0];
    const path = typeof main === 'string' ? main : main?.image_url || main?.url;
    if (path) return resolveImg(path);
  }
  return '';
};

/**
 * Filter and Sort Definitions
 */
export const STATUS_TABS = [
  { label: 'All Products', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
];

export const SORT_OPTIONS = [
  { label: 'Newest Added', value: 'newest' },
  { label: 'Oldest Added', value: 'oldest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Stock: Low to High', value: 'stock_asc' },
  { label: 'Stock: High to Low', value: 'stock_desc' },
  { label: 'Name: A to Z', value: 'name_asc' },
  { label: 'Name: Z to A', value: 'name_desc' },
];
