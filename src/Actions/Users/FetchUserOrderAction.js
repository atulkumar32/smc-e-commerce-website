/**
 * FetchUserOrderAction.js  —  used by Orders page only
 *
 * POST body: { user_id, email, page, limit }
 * Also X-USER-ID header.
 */

import { USER_APIS } from '../../Config/UrlsConfig';

function getCredentials() {
  try {
    const p = JSON.parse(localStorage.getItem('user_profile') || '{}');
    return {
      user_id: p.user_id ?? p.id    ?? p.userId    ?? null,
      email:   p.email   ?? p.Email ?? p.userEmail ?? '',
      token:   localStorage.getItem('user_token') ?? '',
    };
  } catch { return null; }
}

function buildHeaders(creds) {
  return {
    'Content-Type': 'application/json',
    'X-USER-ID':    String(creds.user_id),
    ...(creds.token ? { Authorization: `Bearer ${creds.token}` } : {}),
  };
}

// POST body: { user_id, email, page, limit }
export const fetchUserOrdersList = async ({ page = 1, limit = 10 } = {}) => {
  const creds = getCredentials();
  if (!creds?.user_id) throw new Error('Not authenticated — please log in again');

  const body = { user_id: creds.user_id, email: creds.email, page, limit };

  console.group('📡 [UserOrders] POST', USER_APIS.ORDERS_LIST);
  console.log('user_id :', creds.user_id, '| email:', creds.email);
  console.log('page    :', page, '| limit:', limit);
  console.log('body    :', JSON.stringify(body));
  console.groupEnd();

  const res  = await fetch(USER_APIS.ORDERS_LIST, {
    method: 'POST', headers: buildHeaders(creds), body: JSON.stringify(body),
  });
  const text = await res.text();

  console.group('📨 [UserOrders] Response — HTTP', res.status);
  console.log(text.slice(0, 700));
  console.groupEnd();

  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON */ }
  if (!res.ok || data.status === false) throw new Error(data.message || `HTTP ${res.status}`);

  const d      = data?.data ?? data;
  const orders = Array.isArray(d.orders) ? d.orders : Array.isArray(d) ? d : [];
  const total  = Number(d.total_records ?? d.totalRecords ?? orders.length ?? 0);

  console.log(`✅ [UserOrders] ${orders.length} orders | total_records=${total}`);
  return { orders, total_records: total };
};
