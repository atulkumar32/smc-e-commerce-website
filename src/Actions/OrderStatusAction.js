/**
 * OrderStatusAction.js
 *
 * Approve or reject an order / shipment.
 *
 * POST http://localhost/smc/admin/api/OrderStatusActions.php
 *
 * Request payload:
 * {
 *   "id":          79,               // row id (optional — use order_id or shipment tracking_id)
 *   "order_id":    1457,             // order or shipment id
 *   "action_type": "approved"|"rejected",
 *   "action_by":   5,                // admin user id (optional)
 *   "reason":      "Out of stock",   // required for rejection
 *   "old_status":  "pending",
 *   "new_status":  "approved"|"rejected"
 * }
 *
 * Response:
 * { status: true, message: "...", data: { ... } }
 */

import { URL_ORDER_STATUS_ACTION } from '../Config/UrlsConfig';

/**
 * @param {object} params
 * @param {string|number} params.orderId      — order_id or shipment id
 * @param {'approved'|'rejected'} params.actionType
 * @param {string} params.reason              — reason text (required for rejection)
 * @param {string} params.oldStatus           — current status of the order
 * @param {string|number} [params.actionBy]   — admin user id (optional)
 */
export const orderStatusAction = async ({
  orderId,
  actionType,
  reason = '',
  oldStatus = 'pending',
  actionBy = null,
  source = 'order',   // 'order' | 'shipment' — for logging context
}) => {
  const newStatus = actionType === 'approved' ? 'approved' : 'rejected';

  const payload = {
    order_id:    orderId,
    action_type: actionType,
    reason:      reason.trim(),
    old_status:  oldStatus,
    new_status:  newStatus,
    ...(actionBy ? { action_by: actionBy } : {}),
  };

  console.group(`📋 [OrderStatus] ${source.toUpperCase()} — ${actionType.toUpperCase()}`);
  console.log('URL        :', URL_ORDER_STATUS_ACTION);
  console.log('source     :', source, '(orders page or shipments page)');
  console.log('order_id   :', orderId);
  console.log('action_type:', actionType);
  console.log('old_status :', oldStatus);
  console.log('new_status :', newStatus);
  console.log('reason     :', reason || '(none)');
  console.log('');
  console.log('📤 Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.groupEnd();

  const res = await fetch(URL_ORDER_STATUS_ACTION, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  let data = {};
  try {
    const text = await res.text();
    console.log(`[OrderStatus] Raw response:`, text.slice(0, 500));
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.warn('[OrderStatus] Failed to parse response:', e.message);
  }

  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  if (data.status === false) throw new Error(data.message || 'Action failed');

  console.log(`✅ [OrderStatus] ${actionType} success:`, data);
  return data;
};

// ── Generate Invoice ────────────────────────────────────────────────────────────
// POST { order_id }
// Response: { success, pdf_url, filename }
// → auto-downloads the PDF
export const generateInvoiceAction = async (orderId) => {
  const { URL_GENERATE_INVOICE } = await import('../Config/UrlsConfig');

  const body = { order_id: orderId };

  console.group('🖨️ [Invoice] Generate');
  console.log('URL      :', URL_GENERATE_INVOICE);
  console.log('order_id :', orderId);
  console.log('payload  :', JSON.stringify(body));
  console.groupEnd();

  const res  = await fetch(URL_GENERATE_INVOICE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  let data = {};
  try {
    const text = await res.text();
    console.log('[Invoice] Raw response:', text.slice(0, 400));
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.warn('[Invoice] JSON parse failed:', e.message);
  }

  if (!res.ok || data.success === false)
    throw new Error(data.message || `HTTP ${res.status}`);

  console.log('✅ [Invoice] Generated:', data);
  return data; // { success, pdf_url, filename }
};

// ── Ready To Dispatch ───────────────────────────────────────────────────────────
// POST { order_id, id, admin_id, admin_name }
export const readyToDispatchAction = async ({ order_id, id, admin_id = '', admin_name = '' }) => {
  const { URL_READY_TO_DISPATCH } = await import('../Config/UrlsConfig');

  const body = { order_id, id: String(id), admin_id, admin_name };

  console.group('📦 [Dispatch] Ready To Dispatch');
  console.log('URL      :', URL_READY_TO_DISPATCH);
  console.log('order_id :', order_id, '| id:', id);
  console.log('payload  :', JSON.stringify(body));
  console.groupEnd();

  const res  = await fetch(URL_READY_TO_DISPATCH, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  let data = {};
  try {
    const text = await res.text();
    console.log('[Dispatch] Raw response:', text.slice(0, 400));
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.warn('[Dispatch] JSON parse failed:', e.message);
  }

  if (!res.ok || data.status === false)
    throw new Error(data.message || `HTTP ${res.status}`);

  console.log('✅ [Dispatch] Success:', data);
  return data;
};
