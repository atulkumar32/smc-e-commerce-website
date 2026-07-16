/**
 * DashboardCountActions.js  —  used by Dashboard page only
 *
 * All requests: POST with JSON body { user_id, email, ... }
 * Also X-USER-ID header.
 * user_id + email read from localStorage 'user_profile' (set by saveUserAuth on login).
 */

import { USER_APIS } from '../../Config/UrlsConfig';

// ── Credentials ───────────────────────────────────────────────────────────────
export function getDashboardCredentials() {
  try {
    const p = JSON.parse(localStorage.getItem('user_profile') || '{}');
    return {
      user_id: p.user_id ?? p.id    ?? p.userId    ?? null,
      email:   p.email   ?? p.Email ?? p.userEmail ?? '',
      name:    p.name    ?? p.full_name ?? p.fullName ?? '',
      token:   localStorage.getItem('user_token') ?? '',
    };
  } catch { return null; }
}

function headers(creds) {
  return {
    'Content-Type': 'application/json',
    'X-USER-ID':    String(creds.user_id),
    ...(creds.token ? { Authorization: `Bearer ${creds.token}` } : {}),
  };
}

async function parseRes(res, tag) {
  const text = await res.text();
  console.group(`📨 [${tag}] Response — HTTP ${res.status}`);
  console.log(text.slice(0, 700));
  console.groupEnd();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON */ }
  if (!res.ok || data.status === false) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ── 1. Dashboard counts ────────────────────────────────────────────────────────
// POST body: { user_id, email }
export const fetchDashboardCounts = async () => {
  const creds = getDashboardCredentials();
  if (!creds?.user_id) throw new Error('Not authenticated');

  const body = { user_id: creds.user_id, email: creds.email };

  console.group('📡 [DashboardCounts] POST', USER_APIS.DASHBOARD_COUNT);
  console.log('body:', JSON.stringify(body));
  console.groupEnd();

  const res  = await fetch(USER_APIS.DASHBOARD_COUNT, {
    method: 'POST', headers: headers(creds), body: JSON.stringify(body),
  });
  const data = await parseRes(res, 'DashboardCounts');
  const result = data?.data ?? data;
  console.log('✅ [DashboardCounts]', result);
  return result;
};

// ── 2. Recent orders ──────────────────────────────────────────────────────────
// POST body: { user_id, email, page, limit }
export const fetchDashboardRecentOrders = async ({ page = 1, limit = 5 } = {}) => {
  const creds = getDashboardCredentials();
  if (!creds?.user_id) throw new Error('Not authenticated');

  const body = { user_id: creds.user_id, email: creds.email, page, limit };

  console.group('📡 [DashboardRecentOrders] POST', USER_APIS.ORDERS_LIST);
  console.log('body:', JSON.stringify(body));
  console.groupEnd();

  const res  = await fetch(USER_APIS.ORDERS_LIST, {
    method: 'POST', headers: headers(creds), body: JSON.stringify(body),
  });
  const data = await parseRes(res, 'DashboardRecentOrders');
  const d    = data?.data ?? data;
  const orders = Array.isArray(d.orders) ? d.orders : Array.isArray(d) ? d : [];
  console.log(`✅ [DashboardRecentOrders] ${orders.length} orders`);
  return orders;
};
