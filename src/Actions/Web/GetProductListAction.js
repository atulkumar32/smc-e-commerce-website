// Website product listing API helper
import { WEB_URLS } from "../../Config/UrlsConfig";

export async function fetchWebProductList(params = {}) {
  // If caller passes `null` explicitly, fetch without any query string (all products)
  let url;
  if (params === null) {
    url = WEB_URLS.PRODUCT_LIST;
  } else {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      query.append(key, String(value));
    });
    const qs = query.toString();
    url = qs ? `${WEB_URLS.PRODUCT_LIST}?${qs}` : WEB_URLS.PRODUCT_LIST;
  }

  const response = await fetch(url, { method: 'GET' });
  const text     = await response.text();
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
