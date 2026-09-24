/**
 * DashboardCountActions.js  —  used by Dashboard page only
 *
 * Requests userDashboardTotalCount and userOrderDetailsList
 * user_id + user_email read from localStorage 'user_profile'
 */

import { USER_APIS } from '../../Config/UrlsConfig';

// ── Credentials ───────────────────────────────────────────────────────────────
export function getDashboardCredentials() {
  try {
    const p = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const storedEmail = localStorage.getItem('user_email') || '';
    return {
      user_id: p.user_id ?? p.id    ?? p.userId    ?? null,
      email:   p.email   ?? p.Email ?? p.userEmail ?? p.customer_email ?? storedEmail,
      name:    p.name    ?? p.full_name ?? p.fullName ?? '',
      token:   localStorage.getItem('user_token') ?? '',
    };
  } catch {
    return null;
  }
}

function headers(creds) {
  return {
    'Content-Type': 'application/json',
    // ...(creds?.user_id ? { 'X-USER-ID': String(creds.user_id) } : {}), // Commented out: PHP API does not allow x-user-id header
    ...(creds?.token ? { Authorization: `Bearer ${creds.token}` } : {}),
  };
}

async function parseRes(res, tag) {
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    /* non-JSON */
  }
  if (!res.ok || data.status === false || data.success === false) {
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  }
  return data;
}

// ── 1. Dashboard counts ────────────────────────────────────────────────────────
export const fetchDashboardCounts = async () => {
  const creds = getDashboardCredentials();
  if (!creds?.user_id && !creds?.email) throw new Error('Not authenticated');

  const body = {
    user_id: creds.user_id,
    user_email: creds.email,
    email: creds.email,
  };

  try {
    const res = await fetch(USER_APIS.DASHBOARD_COUNT, {
      method: 'POST',
      headers: headers(creds),
      body: JSON.stringify(body),
    });
    const data = await parseRes(res, 'DashboardCounts');
    return data?.data ?? data;
  } catch (err) {
    console.warn('[DashboardCounts] Falling back to orders summary count:', err.message);
    return null;
  }
};

// ── 2. Recent orders ──────────────────────────────────────────────────────────
// Calls userOrderDetailsList with user_id, user_email, page, per_page
export const fetchDashboardRecentOrders = async ({ page = 1, limit = 5 } = {}) => {
  const creds = getDashboardCredentials();
  if (!creds?.user_id && !creds?.email) return [];

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

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: headers(creds),
  });

  const data = await parseRes(res, 'DashboardRecentOrders');
  const d = data?.data ?? data;
  const rawList = Array.isArray(d) ? d : Array.isArray(d.orders) ? d.orders : [];

  return rawList.map((item) => ({
    ...item,
    id: item.id ?? item.order_id,
    order_id: item.order_id || `SMC-ODR-${String(item.id || '').padStart(5, '0')}`,
    total_amount: Number(item.total_amount ?? item.total ?? item.subtotal ?? 0),
    order_status: item.order_status || item.status || 'confirmed',
    created_at: item.created_at || new Date().toISOString(),
    items: Array.isArray(item.items) ? item.items : [],
  }));
};
