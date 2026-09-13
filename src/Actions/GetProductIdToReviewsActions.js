/**
 * GetProductIdToReviewsActions.js
 *
 * GET  getProductDataToReviews.php  — product list + variants for dropdowns
 * POST SaveReview.php               — create new review
 * GET  GetAllReviews.php            — paginated reviews list
 * POST UpdateReview.php             — edit existing review
 * POST DeleteReview.php             — delete review
 */

import {
  URL_GET_PRODUCTS_FOR_REVIEWS,
  URL_SAVE_REVIEW,
  URL_GET_REVIEWS_LIST,
  URL_UPDATE_REVIEW,
  URL_DELETE_REVIEW,
} from '../Config/UrlsConfig';

// ── Shared parser ─────────────────────────────────────────────────────────────
async function parseResponse(res, tag) {
  const text = await res.text();
  console.group(`📨 [${tag}] HTTP ${res.status}`);
  console.log(text.slice(0, 600));
  console.groupEnd();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (e) {
    console.warn(`[${tag}] JSON parse failed:`, e.message);
  }
  return { data, ok: res.ok };
}

// ── 1. Fetch products + variants ──────────────────────────────────────────────
// Response: { status:"success", data:[{ product_id, product_name, variants:[{id,variant_id}] }] }
export const fetchProductsForReviewsAction = async () => {
  console.log('📡 [fetchProductsForReviews] GET', URL_GET_PRODUCTS_FOR_REVIEWS);
  const res = await fetch(URL_GET_PRODUCTS_FOR_REVIEWS, { method: 'GET' });
  const { data, ok } = await parseResponse(res, 'fetchProductsForReviews');
  if (!ok) throw new Error(data.message || data.msg || `HTTP ${res.status}`);
  const list = Array.isArray(data.data) ? data.data : [];
  console.log(`✅ [fetchProductsForReviews] ${list.length} products`);
  return list;
};

// ── 2. Save new review ────────────────────────────────────────────────────────
// POST body: { product_id, variant_id?, rating, review_text, user_name, user_email?, status }
// Response : { status:"success", msg:"...", data:{ id, product_id, variant_id, rating } }
export const saveReviewAction = async (payload) => {
  console.group('📡 [SaveReview] POST');
  console.log('URL:', URL_SAVE_REVIEW);
  console.log('payload:', JSON.stringify(payload, null, 2));
  console.groupEnd();

  const res = await fetch(URL_SAVE_REVIEW, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const { data, ok } = await parseResponse(res, 'SaveReview');
  if (!ok || data.status === 'error' || data.status === false)
    throw new Error(data.message || data.msg || `HTTP ${res.status}`);
  console.log('✅ [SaveReview]', data);
  return data;
};

// ── 3. Fetch reviews list (paginated + search) ────────────────────────────────
// GET  GetAllReviews.php?page=1&per_page=10&search=
// Response: { status, current_page, per_page, total_records, total_pages,
//             has_next_page, has_prev_page, data:[...] }
export const fetchReviewsListAction = async ({
  page    = 1,
  limit   = 10,
  search  = '',
} = {}) => {
  const params = new URLSearchParams({ page, per_page: limit });
  if (search) params.set('search', search);
  const url = `${URL_GET_REVIEWS_LIST}?${params.toString()}`;

  console.log('📡 [fetchReviewsList] GET', url);
  const res = await fetch(url, { method: 'GET' });
  const { data, ok } = await parseResponse(res, 'fetchReviewsList');
  if (!ok) throw new Error(data.message || data.msg || `HTTP ${res.status}`);

  return {
    reviews:     Array.isArray(data.data) ? data.data : [],
    total:       Number(data.total_records ?? 0),
    total_pages: Number(data.total_pages   ?? 1),
    page:        Number(data.current_page  ?? page),
  };
};

// ── 4. Update review ──────────────────────────────────────────────────────────
// POST body: { id, rating, review_text, user_name, user_email?, status }
export const updateReviewAction = async (payload) => {
  console.group('📡 [UpdateReview] POST');
  console.log('URL:', URL_UPDATE_REVIEW);
  console.log('payload:', JSON.stringify(payload, null, 2));
  console.groupEnd();

  const res = await fetch(URL_UPDATE_REVIEW, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const { data, ok } = await parseResponse(res, 'UpdateReview');
  if (!ok || data.status === 'error' || data.status === false)
    throw new Error(data.message || data.msg || `HTTP ${res.status}`);
  console.log('✅ [UpdateReview]', data);
  return data;
};

// ── 5. Delete review ──────────────────────────────────────────────────────────
// POST body: { id }
export const deleteReviewAction = async (id) => {
  console.log('📡 [DeleteReview] POST id:', id);
  const res = await fetch(URL_DELETE_REVIEW, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  const { data, ok } = await parseResponse(res, 'DeleteReview');
  if (!ok || data.status === 'error' || data.status === false)
    throw new Error(data.message || data.msg || `HTTP ${res.status}`);
  console.log('✅ [DeleteReview]', data);
  return data;
};
