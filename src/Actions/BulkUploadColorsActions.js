/**
 * BulkUploadColorsActions.js
 *
 * POST BulkUploadColors.php     — upload CSV/Excel file
 * GET  getuploadedcolors.php    — fetch list of saved colours
 */

import {
  URL_BULK_UPLOAD_COLORS,
  URL_GET_UPLOADED_COLORS,
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

// ── 1. Bulk upload colours via CSV / Excel ────────────────────────────────────
export const bulkUploadColorsAction = async (file) => {
  if (!file) throw new Error('No file selected for bulk upload');

  const formData = new FormData();
  formData.append('file', file, file.name);

  console.group('📡 [BulkUploadColors] POST');
  console.log('URL  :', URL_BULK_UPLOAD_COLORS);
  console.log('file :', file.name, `(${(file.size / 1024).toFixed(1)} KB)`);
  console.groupEnd();

  const res = await fetch(URL_BULK_UPLOAD_COLORS, {
    method: 'POST',
    body: formData,
  });

  const { data, ok } = await parseResponse(res, 'BulkUploadColors');

  // Note: we do NOT throw on data.status === false here —
  // the caller (normaliseUploadResult) decides how to display it.
  if (!ok) throw new Error(data.message || `HTTP ${res.status}`);

  console.log('✅ [BulkUploadColors]', data);
  return data;
};

// ── 2. Fetch uploaded colours list ────────────────────────────────────────────
export const fetchUploadedColorsAction = async () => {
  console.group('📡 [GetUploadedColors] GET');
  console.log('URL:', URL_GET_UPLOADED_COLORS);
  console.groupEnd();

  const res = await fetch(URL_GET_UPLOADED_COLORS, { method: 'GET' });
  const { data, ok } = await parseResponse(res, 'GetUploadedColors');

  if (!ok) throw new Error(data.message || `HTTP ${res.status}`);

  // Accept { success, data: [...] } shape
  const list = Array.isArray(data.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];

  console.log(`✅ [GetUploadedColors] ${list.length} records`);
  return list;
};
