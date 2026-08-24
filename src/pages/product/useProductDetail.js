import { useState, useEffect } from 'react';
import { MEDIA_BASE } from '../../Config/UrlsConfig';
import { FetchProductDetailsActions } from '../../Actions/Web/GetProductDetailsActions';
import { productIdFromSlug } from '../../utils/slug';

// ── Image resolver ────────────────────────────────────────────────────────────
// Encodes only the filename segment so spaces/parens in filenames work correctly.
// Target: https://shreemahaveercollections.com/apis/v1/uploads/products/WhatsApp%20Image...jpeg
function resolveImg(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean    = path.replace(/^\/+/, '');
  const segments = clean.split('/');
  const filename = segments[segments.length - 1];
  const dir      = segments.slice(0, -1).join('/');
  const encoded  = dir ? `${dir}/${encodeURIComponent(filename)}` : encodeURIComponent(filename);
  return `${MEDIA_BASE}${encoded}`;
}

// ── Map a single variant from the API ────────────────────────────────────────
function mapVariant(v) {
  const imgs = Array.isArray(v.images) ? v.images : [];
  // Sort: is_main first
  const sorted = [...imgs].sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0));
  const gallery = sorted.map((i) => resolveImg(i.image_url || ''));

  return {
    variantId:    v.variant_id || '',
    sku:          v.sku || '',
    colorName:    v.color_name || '',
    colorHex:     v.color_hex  || '#cccccc',
    size:         v.size       || 'Free Size',
    mrp:          Number(v.mrp           ?? 0),
    sellingPrice: Number(v.selling_price ?? v.mrp ?? 0),
    discountPrice:Number(v.discount_price ?? v.selling_price ?? 0),
    stock:        Number(v.stock ?? 0),
    status:       v.status,
    gallery,                          // resolved image URLs for this variant
    primaryImage: gallery[0] || '',
  };
}

// ── Map full product API response ─────────────────────────────────────────────
function mapProductResponse(product) {
  if (!product) return null;

  // Top-level images (strings like "uploads/products/...")
  const topImages = Array.isArray(product.images) ? product.images : [];
  const topGallery = topImages.map((img) => {
    const raw = typeof img === 'string' ? img : (img?.image_url || img?.url || '');
    return resolveImg(raw);
  });
  const topPrimary = resolveImg(product.primary_image || '') || topGallery[0] || '';

  // Variants
  const variants = Array.isArray(product.variants)
    ? product.variants.map(mapVariant)
    : [];

  // Build colour list from variants (deduplicated by hex)
  const seen = new Set();
  const variantColors = variants
    .filter((v) => v.colorHex && !seen.has(v.colorHex) && seen.add(v.colorHex))
    .map((v) => ({ name: v.colorName, hex: v.colorHex }));

  // Features: can be JSON string of array or array
  let features = [];
  try {
    const raw = product.features;
    if (Array.isArray(raw)) features = raw;
    else if (typeof raw === 'string') features = JSON.parse(raw);
  } catch { features = []; }

  return {
    id:               product.product_id || product.id || '',
    name:             product.product_name || product.name || 'Product',
    genericName:      product.generic_name || null,
    brand:            product.brand || null,
    categoryId:       product.category_id || null,
    categoryName:     product.category_name || null,
    shortDescription: product.short_description || null,
    description:      product.full_description || product.description || null,
    features,

    // Top-level pricing (may be null if price lives only in variants)
    price:            Number(product.selling_price ?? product.price ?? product.mrp ?? 0),
    originalPrice:    Number(product.mrp ?? product.price ?? 0) || null,

    stock:            Number(product.stock ?? 0),
    badge:            product.badge || null,
    isNewArrival:     Boolean(product.is_new_arrival),
    isLive:           product.is_live === true || product.is_live === 1,

    material:         product.material      || null,
    pattern:          product.pattern       || null,
    gender:           product.gender        || null,
    bagCapacity:      product.capacity      || null,
    netWeight:        product.net_weight    || null,
    recommendedAge:   product.recommended_age || null,
    backpackStyle:    product.backpack_style  || null,
    countryOfOrigin:  product.country_of_origin || null,
    characterName:    product.character_name   || null,
    classType:        product.class_type        || null,
    gst:              product.gst               || null,

    // Sizes from variants (deduplicated)
    sizes:      [...new Set(variants.map((v) => v.size).filter(Boolean))],
    outOfSizes: variants.filter((v) => v.stock === 0).map((v) => v.size),

    // Top-level gallery (used when no variant is selected / no variant images)
    gallery:      topGallery.length > 0 ? topGallery : [topPrimary].filter(Boolean),
    primaryImage: topPrimary,

    // Variants with full image galleries
    variants,
    variantColors,   // [{ name, hex }] deduplicated

    rating:      Number(product.rating ?? 4),
    reviewCount: Number(product.reviewCount ?? product.review_count ?? 0),
    accordion:   product.accordion || [],
    raw:         product,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export default function useProductDetail(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let active = true;
    if (!productId) {
      setProduct(null);
      setLoading(false);
      setError('Missing product id');
      return;
    }

    // Support both plain product_id ("SMC-00004") and SEO slugs
    // ("premium-girls-backpack-smc-00004") — extract the real ID from the slug
    const resolvedId = productIdFromSlug(productId);

    async function fetchDetail() {
      setLoading(true);
      setError('');
      try {
        const resp = await fetch(FetchProductDetailsActions(resolvedId), {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        });

        if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
        const data = await resp.json();
        if (!data || data.status === false) throw new Error(data.message || 'Failed to fetch product');

        const normalized = mapProductResponse(data.product || data);
        if (!active) return;
        setProduct(normalized);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Unable to fetch product');
        setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDetail();
    return () => { active = false; };
  }, [productId]);

  return { product, loading, error };
}
