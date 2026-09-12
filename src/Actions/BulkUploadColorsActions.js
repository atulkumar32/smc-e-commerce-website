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

// ── 2. Fetch uploaded colours list (paginated + search) ───────────────────────
// GET getColorsList.php?search=blue&page=1&limit=10
export const fetchUploadedColorsAction = async ({
  search = '',
  page   = 1,
  limit  = 10,
} = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);

  const url = `${URL_GET_UPLOADED_COLORS}?${params.toString()}`;

  console.group('📡 [GetColorsList] GET');
  console.log('URL:', url);
  console.groupEnd();

  const res = await fetch(url, { method: 'GET' });
  const { data, ok } = await parseResponse(res, 'GetColorsList');

  if (!ok) throw new Error(data.message || `HTTP ${res.status}`);

  const list = Array.isArray(data.data) ? data.data : [];

  console.log(`✅ [GetColorsList] ${list.length} / ${data.total} records`);

  return {
    colors:      list,
    total:       Number(data.total       ?? 0),
    total_pages: Number(data.total_pages ?? 1),
    has_next:    Boolean(data.has_next),
    has_prev:    Boolean(data.has_prev),
    page:        Number(data.page        ?? page),
    limit:       Number(data.limit       ?? limit),
  };
};
