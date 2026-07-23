/**
 * SavePincodeAction.js
 *
 * POST  savePincodes.php
 *
 * Body:
 * {
 *   "pincode":                 "243501",
 *   "state":                   "Delhi",
 *   "city":                    "New Delhi",
 *   "status":                  "serviceable" | "non-serviceable",
 *   "delivery_charge":         50,
 *   "estimated_delivery_time": "2-3 Days",
 *   "notes":                   "Fast delivery available"
 * }
 *
 * Response (success):
 * { "status": true, "message": "...", "data": { ... } }
 */

import { URL_SAVE_PINCODE } from '../Config/UrlsConfig';

/**
 * Save (create or update) a pincode entry.
 *
 * @param {object} form  — the pincode form values
 * @returns {Promise<object>}  API response
 */
export const savePincodeAction = async (form) => {
  const payload = {
    pincode:                  String(form.pincode).trim(),
    state:                    String(form.state   || '').trim(),
    city:                     String(form.city    || '').trim(),
    status:                   form.status || 'serviceable',
    delivery_charge:          Number(form.delivery_charge) || 0,
    estimated_delivery_time:  form.delivery_time || form.estimated_delivery_time || '',
    notes:                    String(form.notes  || '').trim(),
  };

  console.group('📡 [SavePincode] POST');
  console.log('URL     :', URL_SAVE_PINCODE);
  console.log('payload :', JSON.stringify(payload, null, 2));
  console.groupEnd();

  const res  = await fetch(URL_SAVE_PINCODE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  const text = await res.text();
  console.group('📨 [SavePincode] Response — HTTP', res.status);
  console.log(text.slice(0, 600));
  console.groupEnd();

  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (e) {
    console.warn('[SavePincode] JSON parse failed:', e.message);
  }

  if (!res.ok || data.status === false)
    throw new Error(data.message || `HTTP ${res.status}`);

  console.log('✅ [SavePincode] Saved:', data);
  return data;
};

/**
 * Fetch paginated pincode list
 *
 * GET GetPincodeList.php?page=1&per_page=10&pincode=&state=
 *
 * Response shape:
 * {
 *   status, message, current_page, per_page, total_records, total_pages,
 *   data: [{ id, pincode, state, city, status, delivery_charge,
 *             estimated_delivery_time, notes, created_at }]
 * }
 */
export const fetchPincodeListAction = async ({
  page     = 1,
  per_page = 10,
  pincode  = '',
  state    = '',
} = {}) => {
  const { URL_GET_PINCODE_LIST } = await import('../Config/UrlsConfig');

  const params = new URLSearchParams({ page, per_page });
  if (pincode) params.set('pincode', pincode);
  if (state)   params.set('state',   state);

  const url = `${URL_GET_PINCODE_LIST}?${params.toString()}`;

  console.group('📡 [GetPincodeList] GET');
  console.log('URL:', url);
  console.groupEnd();

  const res  = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  const text = await res.text();

  console.group('📨 [GetPincodeList] Response — HTTP', res.status);
  console.log(text.slice(0, 600));
  console.groupEnd();

  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (e) {
    console.warn('[GetPincodeList] JSON parse failed:', e.message);
  }

  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

  const list = Array.isArray(data.data) ? data.data : [];
  console.log(`✅ [GetPincodeList] ${list.length} pincodes, total=${data.total_records}`);

  return {
    pincodes:      list,
    total_records: Number(data.total_records  ?? 0),
    total_pages:   Number(data.total_pages    ?? 1),
    current_page:  Number(data.current_page   ?? 1),
  };
};
