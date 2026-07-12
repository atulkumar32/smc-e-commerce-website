import { useState, useEffect } from 'react';
import { MEDIA_BASE } from '../../Config/UrlsConfig';
import { BASE_URL } from '../../Config/ApiConfig';
import { FetchProductDetailsActions } from '../../Actions/Web/GetProductDetailsActions';

function resolveApiImage(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.replace(/^\/+/, '');
  if (normalized.startsWith('smc/')) {
    return `${BASE_URL}${normalized}`;
  }
  return `${MEDIA_BASE}${normalized}`;
}

function normalizeColor(color) {
  if (!color) return null;
  if (typeof color === 'string') return color;
  if (typeof color === 'object') return color.hex || color.value || color.code || null;
  return null;
}

function mapProductResponse(product) {
  if (!product) return null;

  const images = Array.isArray(product.images) ? product.images : [];
  const gallery = images.map((img) => {
    const raw = img.image_url || img.url || img.data || img;
    return resolveApiImage(typeof raw === 'string' ? raw : '');
  });
  const primary = resolveApiImage(product.primary_image || (gallery[0] ?? ''));

  const colors = Array.isArray(product.colors)
    ? product.colors.map(normalizeColor).filter(Boolean)
    : typeof product.colors === 'string'
      ? product.colors.split(',').map((v) => normalizeColor(v.trim())).filter(Boolean)
      : [];

  return {
    id: product.product_id || product.id || '',
    name: product.product_name || product.name || 'Product',
    genericName: product.generic_name || null,
    brand: product.brand || null,
    categoryId: product.category_id || null,
    categoryName: product.category_name || null,
    shortDescription: product.short_description || null,
    description: product.full_description || product.description || null,
    price: Number(product.selling_price ?? product.discount_price ?? product.price ?? product.mrp ?? 0),
    originalPrice: Number(product.mrp ?? product.price ?? 0) || null,
    discountPercent: Number(product.discount_percent ?? 0),
    stock: Number(product.stock ?? 0),
    isLive: Boolean(
      product.is_live ??
      (product.status === 'published' || product.status === 'live' || product.is_live === 1)
    ),
    isNewArrival: Boolean(product.is_new_arrival),
    showInCardSlider: Boolean(product.show_in_card_slider),
    size: product.size || null,
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    outOfSizes: Array.isArray(product.outOfSizes) ? product.outOfSizes : [],
    countryOfOrigin: product.country_of_origin || null,
    material: product.material || null,
    pattern: product.pattern || null,
    gender: product.gender || null,
    bagCapacity: product.bag_capacity || null,
    netWeight: product.net_weight || null,
    recommendedAge: product.recommended_age || null,
    backpackStyle: product.backpack_style || null,
    colors,
    colorNames: product.colorNames || {},
    gallery: gallery.length > 0 ? gallery : [primary],
    primaryImage: primary,
    badge: product.badge || null,
    createdAt: product.created_at || null,
    rating: Number(product.rating ?? 4),
    reviewCount: Number(product.reviewCount ?? product.review_count ?? 0),
    accordion: product.accordion || [],
    raw: product,
  };
}

export default function useProductDetail(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function fetchDetail() {
      if (!productId) {
        setProduct(null);
        setLoading(false);
        setError('Missing product id');
        return;
      }
      // console.log("PRODUCTID :", productId)
      setLoading(true);
      setError('');
      // products/[object%20Object]smc/api/v1/data/GetProductDetails.php
      try {
        const resp = await fetch(FetchProductDetailsActions(productId), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          // cache: 'no-store' // optional: if you want fresh data
        });

        if (!resp.ok) {
          const errorText = await resp.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Server error: ${resp.status} ${resp.statusText}`);
        }

        const data = await resp.json();

        if (!data || data.status === false) {
          throw new Error(data.message || 'Failed to fetch product details');
        }

        const payload = data.product || data;
        const normalized = mapProductResponse(payload);

        if (!active) return;
        setProduct(normalized);

      } catch (err) {
        if (!active) return;
        setError(err.message || 'Unable to fetch product');
        setProduct(null);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    fetchDetail();
    return () => { active = false; };
  }, [productId]);

  return { product, loading, error };
}
