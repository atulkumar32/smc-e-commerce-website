import { URL_ADMIN_GET_SHIPMENT_DETAILS } from '../Config/UrlsConfig';

/**
 * FetchShipmentDetailsAction
 *
 * Fetches paginated shipments from the admin API.
 *
 * Params:
 *   page       – 1-based page number (default 1)
 *   limit      – rows per page      (default 10)
 *   search     – free-text search
 *   startdate  – YYYY-MM-DD
 *   enddate    – YYYY-MM-DD
 *   status     – shipment_status filter
 *
 * API response shape:
 * {
 *   status: true,
 *   message: "...",
 *   current_page: 1,
 *   per_page: 10,
 *   total_records: 21,
 *   total_pages: 3,
 *   has_next: true,
 *   has_prev: false,
 *   data: [ { id, order_id, customer_name, tracking_id, shipment_status, ... } ]
 * }
 */
export const FetchShipmentDetailsAction = async ({
  page      = 1,
  limit     = 10,
  search,
  startdate,
  enddate,
  status,
} = {}) => {
  try {
    const params = new URLSearchParams();
    params.set('page',  page);
    params.set('limit', limit);
    if (search)    params.set('search',    search);
    if (startdate) params.set('startdate', startdate);
    if (enddate)   params.set('enddate',   enddate);
    if (status)    params.set('status',    status);

    const url = `${URL_ADMIN_GET_SHIPMENT_DETAILS}?${params.toString()}`;
    console.log('[FetchShipmentDetails] GET', url);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!data) throw new Error('Empty response from server');

    return data;
  } catch (err) {
    console.error('[FetchShipmentDetails] Error:', err.message);
    throw err;
  }
};
