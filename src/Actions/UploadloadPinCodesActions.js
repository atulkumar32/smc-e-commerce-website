/**
 * UploadloadPinCodesActions.js
 *
 * All Pincode-related API calls.
 * URLs come from UrlsConfig.js
 *
 * GET  GetPincodeList.php?page=1&per_page=10&pincode=&state=
 * POST savePincodes.php   body: { pincode, state, city, status, delivery_charge,
 *                                 estimated_delivery_time, notes }
 * GET  checkPincode.php?pincode=XXXXXX
 */

import {
  URL_GET_PINCODE_LIST,
  URL_SAVE_PINCODE,
  URL_CHECK_PINCODE,
  URL_BULK_UPLOAD_PINCODES,
} from '../Config/UrlsConfig';

// ── Shared response parser ────────────────────────────────────────────────────
async function parseResponse(res, tag) {
  const text = await res.text();
  console.group(`📨 [${tag}] Response — HTTP ${res.status}`);
  console.log(text.slice(0, 600));
  console.groupEnd();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (e) {
    console.warn(`[${tag}] JSON parse failed:`, e.message);
  }
  return { data, ok: res.ok };
}

// ── 1. Fetch pincode list ──────────────────────────────────────────────────────
// GET GetPincodeList.php?page=1&per_page=10&pincode=&state=
export const fetchPincodeListAction = async ({
  page     = 1,
  per_page = 10,
  pincode  = '',
  state    = '',
} = {}) => {
  const params = new URLSearchParams({ page, per_page });
  if (pincode) params.set('pincode', pincode);
  if (state)   params.set('state',   state);

  const url = `${URL_GET_PINCODE_LIST}?${params.toString()}`;

  console.group('📡 [GetPincodeList] GET');
  console.log('URL:', url);
  console.groupEnd();

  const res          = await fetch(url, { method: 'GET' });
  const { data, ok } = await parseResponse(res, 'GetPincodeList');

  if (!ok) throw new Error(data.message || `HTTP ${res.status}`);

  const list = Array.isArray(data.data) ? data.data : [];
  console.log(`✅ [GetPincodeList] ${list.length} records | total=${data.total_records}`);

  return {
    pincodes:      list,
    total_records: Number(data.total_records  ?? 0),
    total_pages:   Number(data.total_pages    ?? 1),
    current_page:  Number(data.current_page   ?? 1),
  };
};

// ── 2. Save (create/update) a pincode ────────────────────────────────────────
// POST savePincodes.php
// body: { pincode, state, city, status, delivery_charge, estimated_delivery_time, notes }
export const savePincodeAction = async (form) => {
  const payload = {
    pincode:                 String(form.pincode).trim(),
    state:                   String(form.state   || '').trim(),
    city:                    String(form.city    || '').trim(),
    status:                  form.status || 'serviceable',
    delivery_charge:         Number(form.delivery_charge) || 0,
    estimated_delivery_time: form.estimated_delivery_time || form.delivery_time || '',
    notes:                   String(form.notes  || '').trim(),
  };

  console.group('📡 [SavePincode] POST');
  console.log('URL     :', URL_SAVE_PINCODE);
  console.log('payload :', JSON.stringify(payload, null, 2));
  console.groupEnd();

  const res          = await fetch(URL_SAVE_PINCODE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  const { data, ok } = await parseResponse(res, 'SavePincode');

  if (!ok || data.status === false)
    throw new Error(data.message || `HTTP ${res.status}`);

  console.log('✅ [SavePincode]', data);
  return data;
};

// ── 3. Check if a pincode is serviceable ──────────────────────────────────────
// GET checkPincode.php?pincode=XXXXXX
export const checkPincodeAction = async (pincode) => {
  if (!pincode || String(pincode).trim().length !== 6) {
    return { available: false, message: 'Please enter a valid 6-digit pincode', data: null };
  }

  const url = `${URL_CHECK_PINCODE}?pincode=${encodeURIComponent(pincode.trim())}`;

  console.group('📡 [CheckPincode] GET');
  console.log('URL     :', url);
  console.log('pincode :', pincode);
  console.groupEnd();

  try {
    const res          = await fetch(url, { method: 'GET' });
    const { data }     = await parseResponse(res, 'CheckPincode');

    const d         = data.data || {};
    const available = data.status === true
      && (d.status === 'serviceable' || String(data.message || '').toLowerCase().includes('available'));

    console.log(available
      ? `✅ [CheckPincode] Serviceable — ${d.city}, ${d.state} | ₹${d.delivery_charge} | ${d.estimated_delivery_time}`
      : `❌ [CheckPincode] Not serviceable — ${data.message}`
    );

    return {
      available,
      message:           data.message || (available ? 'Delivery available' : 'Delivery not available'),
      data:              available ? d : null,
      city:              d.city               || '',
      state:             d.state              || '',
      deliveryCharge:    Number(d.delivery_charge ?? 0),
      estimatedDelivery: d.estimated_delivery_time || '',
      notes:             d.notes              || '',
    };
  } catch (err) {
    console.error('❌ [CheckPincode] Network error:', err.message);
    return { available: false, message: 'Unable to check pincode. Please try again.', data: null };
  }
};

// ── 4. Bulk upload pincodes via CSV/Excel file ────────────────────────────────
// POST BulkUploadPincodes.php  body: FormData with the file
export const bulkUploadPincodesAction = async (file) => {
  if (!file) throw new Error('No file selected for bulk upload');

  const formData = new FormData();
  formData.append('file', file, file.name);

  console.group('📡 [BulkUploadPincodes] POST');
  console.log('URL      :', URL_BULK_UPLOAD_PINCODES);
  console.log('file     :', file.name, `(${(file.size / 1024).toFixed(1)} KB, ${file.type})`);
  console.groupEnd();

  const res = await fetch(URL_BULK_UPLOAD_PINCODES, {
    method: 'POST',
    body:   formData,
    // No Content-Type header — browser sets multipart boundary automatically
  });

  const text = await res.text();
  console.group('📨 [BulkUploadPincodes] Response — HTTP', res.status);
  console.log(text.slice(0, 600));
  console.groupEnd();

  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (e) {
    console.warn('[BulkUploadPincodes] JSON parse failed:', e.message);
  }

  if (!res.ok || data.status === false)
    throw new Error(data.message || `HTTP ${res.status}`);

  console.log('✅ [BulkUploadPincodes]', data);
  return data;
  // Expected response: { status: true, message: "...", inserted: N, failed: N, errors: [] }
};
