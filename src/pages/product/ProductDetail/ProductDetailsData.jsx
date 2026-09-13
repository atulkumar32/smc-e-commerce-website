/**
 * ProductDetailsData.jsx
 *
 * Data layer for the Product Detail page.
 *
 * useProductReviews(productId)
 *   - Does NOT fetch on mount.
 *   - Call fetchReviews() only when the user clicks the reviews count link.
 *   - Fetches only once (guarded by `fetched` flag — no re-fetch on re-open).
 *
 * API: GET GetReviewAndRatings.php?product_id=PROD123
 * Response shape:
 *   { status: true, product_id, total_reviews, average_rating, reviews: [...] }
 */

import { useState, useCallback } from 'react';
import { URL_GET_PRODUCT_REVIEWS } from '../../../Config/UrlsConfig';

// ── Loader ────────────────────────────────────────────────────────────────────
async function loadProductReviews(productId) {
  const url = `${URL_GET_PRODUCT_REVIEWS}?product_id=${encodeURIComponent(productId)}`;
  console.log('📡 [GetReviewAndRatings] GET', url);

  const res  = await fetch(url, { method: 'GET' });
  const text = await res.text();

  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (e) {
    console.warn('[GetReviewAndRatings] JSON parse failed:', e.message);
  }

  if (!res.ok || data.status === false)
    throw new Error(data.message || data.msg || `HTTP ${res.status}`);

  // Response: { status:true, total_reviews, average_rating, reviews:[...] }
  const reviews   = Array.isArray(data.reviews) ? data.reviews : [];
  const total     = Number(data.total_reviews  ?? reviews.length);
  const avgRating = Number(data.average_rating ?? 0);

  console.log(`✅ [GetReviewAndRatings] ${reviews.length} reviews, avg ${avgRating}`);
  return { reviews, total, avgRating };
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useProductReviews(productId) {
  const [reviews,   setReviews]   = useState([]);
  const [total,     setTotal]     = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [fetched,   setFetched]   = useState(false); // only fetch once

  const fetchReviews = useCallback(async () => {
    if (!productId || fetched) return;
    setLoading(true);
    setError('');
    try {
      const result = await loadProductReviews(productId);
      setReviews(result.reviews);
      setTotal(result.total);
      setAvgRating(result.avgRating);
      setFetched(true);
    } catch (err) {
      console.error('[useProductReviews]', err.message);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId, fetched]);

  return { reviews, total, avgRating, loading, error, fetchReviews, fetched };
}
