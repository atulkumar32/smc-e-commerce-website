// Website product listing API helper
import { WEB_URLS } from '../../Config/UrlsConfig';

const DEFAULT_PARAMS = {
  category: null,
  sort: null,
  page: 1,
  limit: 12,
};

function buildQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries({ ...DEFAULT_PARAMS }).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    query.append(key, String(value));
  });

  return query.toString();
}

export async function fetchWebProductList(params = {}) {
  // If caller passes `null` explicitly, send request without any query string
  if (params === null) {
    const url = WEB_URLS.PRODUCT_LIST;
    const response = await fetch(url, { method: 'GET' });
   
    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Invalid JSON response from product API');
    }

    if (!response.ok) {
      throw new Error(data.message || `Server error (${response.status})`);
    }

    if (data.status === false) {
      throw new Error(data.message || 'Product API returned an error');
    }

    return data;
  }

  const query = buildQueryString(params);
  const url = query ? `${WEB_URLS.PRODUCT_LIST}?${query}` : WEB_URLS.PRODUCT_LIST;

  const response = await fetch(url, { method: 'GET' });
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Invalid JSON response from product API');
  }

  if (!response.ok) {
    throw new Error(data.message || `Server error (${response.status})`);
  }

  if (data.status === false) {
    throw new Error(data.message || 'Product API returned an error');
  }

  return data;
}
