/**
 * FetchUserOrderAction.js  —  Customer Orders API integration
 *
 * Endpoint: https://shreemahaveercollections.com/apis/v1/smc/user/api/userOrderDetailsList.php
 *
 * Query Parameters:
 *   - user_id    : matches WHERE user_id = :user_id
 *   - user_email : matches WHERE customer_email = :user_email
 *   - Both       : matches WHERE user_id = :user_id OR customer_email = :user_email
 *   - page, per_page, limit
 *
 * Response Structure:
 *   {
 *     "success": true,
 *     "summary": { "all_orders": 3, "processing": 0, "in_transit": 0, "delivered": 0, "cancelled": 0 },
 *     "current_page": 1,
 *     "per_page": 10,
 *     "total_records": 3,
 *     "total_pages": 1,
 *     "data": [ ...orders ]
 *   }
 */

import { USER_APIS } from '../../Config/UrlsConfig';

function getCredentials() {
  try {
    const p = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const storedEmail = localStorage.getItem('user_email') || '';
    return {
      user_id: p.user_id ?? p.id    ?? p.userId    ?? null,
      email:   p.email   ?? p.Email ?? p.userEmail ?? p.customer_email ?? storedEmail,
      token:   localStorage.getItem('user_token') ?? '',
    };
  } catch {
    return null;
  }
}

function buildHeaders(creds) {
  return {
    'Content-Type': 'application/json',
    // ...(creds?.user_id ? { 'X-USER-ID': String(creds.user_id) } : {}), // Commented out: PHP API does not allow x-user-id header
    ...(creds?.token ? { Authorization: `Bearer ${creds.token}` } : {}),
  };
}

/**
 * Fetch orders list for authenticated user by user_id and/or user_email
 * @param {Object} options - { page = 1, limit = 10, search = '' }
 * @returns {Promise<{ orders: Array, total_records: number, total_pages: number, current_page: number, summary: Object }>}
 */
export const fetchUserOrdersList = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const creds = getCredentials();
  if (!creds?.user_id && !creds?.email) {
    throw new Error('Not authenticated — please log in again to view your orders');
  }

  // Construct URL with query parameters matching backend specification:
  // user_id, user_email, page, per_page, limit
  const endpoint = USER_APIS.ORDERS_LIST;
  const url = new URL(endpoint, window.location.origin);

  if (creds.user_id) {
    url.searchParams.set('user_id', String(creds.user_id));
  }
  if (creds.email) {
    url.searchParams.set('user_email', String(creds.email).trim());
  }
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(limit));
  url.searchParams.set('limit', String(limit));
  if (search) {
    url.searchParams.set('search', String(search).trim());
  }

  console.group('📡 [UserOrders] GET', url.toString());
  console.log('user_id    :', creds.user_id);
  console.log('user_email :', creds.email);
  console.log('page       :', page, '| per_page:', limit);
  console.groupEnd();

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: buildHeaders(creds),
  });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.warn('[UserOrders] Non-JSON response:', text.slice(0, 300));
  }

  if (!res.ok || data.success === false || data.status === false) {
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  }

  // Parse orders array from `data.data` (spec) or fallbacks
  const rawList = Array.isArray(data.data)
    ? data.data
    : Array.isArray(data.orders)
    ? data.orders
    : Array.isArray(data)
    ? data
    : [];

  // Normalize order fields
  const orders = rawList.map((item) => ({
    ...item,
    id: item.id ?? item.order_id,
    order_id: item.order_id || `SMC-ODR-${String(item.id || '').padStart(5, '0')}`,
    total_amount: Number(item.total_amount ?? item.total ?? item.subtotal ?? 0),
    order_status: item.order_status || item.status || 'confirmed',
    created_at: item.created_at || new Date().toISOString(),
    items: Array.isArray(item.items) ? item.items : [],
  }));

  const totalRecords = Number(data.total_records ?? data.totalRecords ?? orders.length ?? 0);
  const totalPages   = Number(data.total_pages ?? data.totalPages ?? Math.ceil(totalRecords / limit) ?? 1);
  const currentPage  = Number(data.current_page ?? data.currentPage ?? page);
  const summary      = data.summary || {
    all_orders: totalRecords,
    processing: 0,
    in_transit: 0,
    delivered: 0,
    cancelled: 0,
  };

  console.log(`✅ [UserOrders] Received ${orders.length} orders | total=${totalRecords} | summary=`, summary);

  return {
    orders,
    total_records: totalRecords,
    total_pages: totalPages,
    current_page: currentPage,
    summary,
  };
};
