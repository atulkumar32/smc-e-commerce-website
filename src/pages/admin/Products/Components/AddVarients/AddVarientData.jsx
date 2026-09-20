/**
 * AddVarientData.jsx
 *
 * Data layer for the Add Variants page.
 *
 * useAllVariants()   — fetches ALL products (all pages) from GetProducts.php,
 *                      then flattens every product's variants[] into one list.
 *                      Also returns the products array for the "add" dropdown.
 *
 * useDeleteVariant() — wraps deleteVariantAction with loading state.
 */

import { useState, useEffect, useCallback } from 'react';
import { URL_PRODUCTS_FETCH }      from '../../../../../Config/UrlsConfig';
import { deleteVariantAction }     from '../../../../../Actions/ProductVariantAction';
import { MEDIA_BASE }              from '../../../../../Config/UrlsConfig';

// ── Image resolver ─────────────────────────────────────────────────────────────
export function resolveImg(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const segs = path.split('/');
  const fn   = segs[segs.length - 1];
  const dir  = segs.slice(0, -1).join('/');
  return `${MEDIA_BASE}${dir ? `${dir}/${encodeURIComponent(fn)}` : encodeURIComponent(fn)}`;
}

// ── Fetch ALL products across all pages ───────────────────────────────────────
async function fetchAllProducts() {
  let page  = 1;
  let all   = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res  = await fetch(`${URL_PRODUCTS_FETCH}?page=${page}&per_page=50`, { method: 'GET' });
    const text = await res.text();
    let data   = {};
    try { data = text ? JSON.parse(text) : {}; } catch { /* ignore */ }
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

    // API shape: { status:true, products:[...], totalPages, page }
    const list = Array.isArray(data.products) ? data.products
               : Array.isArray(data.data)     ? data.data : [];

    all = [...all, ...list];

    const totalPages = Number(data.totalPages ?? data.total_pages ?? 1);
    if (page >= totalPages || list.length === 0) break;
    page++;
  }
  return all;
}

// ── Hook: all variants (flattened from all products) ──────────────────────────
export function useAllVariants() {
  const [products,  setProducts]  = useState([]);   // raw products list (for dropdown)
  const [variants,  setVariants]  = useState([]);   // flattened + enriched variant rows
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const prods = await fetchAllProducts();
      setProducts(prods);

      // Flatten all variants, enriching each with product name
      const flat = [];
      prods.forEach((p) => {
        if (!Array.isArray(p.variants)) return;
        p.variants.forEach((v) => {
          // Resolve main image
          const imgs    = Array.isArray(v.images) ? v.images : [];
          const mainImg = imgs.find((i) => i.is_main) || imgs[0];
          flat.push({
            ...v,
            _product_name: p.product_name || p.name || '',
            _thumb:        resolveImg(mainImg?.image_url || ''),
          });
        });
      });
      setVariants(flat);
      console.log(`✅ [useAllVariants] ${flat.length} variants from ${prods.length} products`);
    } catch (err) {
      console.error('[useAllVariants]', err.message);
      setError(err.message || 'Failed to load variants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { products, variants, loading, error, refetch: load };
}

// ── Hook: delete a variant ────────────────────────────────────────────────────
export function useDeleteVariant(onSuccess) {
  const [deleting, setDeleting] = useState(null); // variant_id being deleted

  const handleDelete = useCallback(async (variant) => {
    const vid = variant.variant_id || variant.id;
    if (!window.confirm(`Delete variant ${vid}?\nThis cannot be undone.`)) return;
    setDeleting(vid);
    try {
      await deleteVariantAction(vid);
      onSuccess?.();
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  }, [onSuccess]);

  return { deleting, handleDelete };
}
