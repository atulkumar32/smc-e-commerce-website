/**
 * GetAdminOrderDetailsActions.js
 *
 * GET GetOrderDetails.php with these supported params:
 *   page, limit, card, status, startdate, enddate, search
 *
 * card values: accepted | upcoming | cancelled | to_pack | in_transit | completed
 * (omit card for all orders)
 */

import { URL_ADMIN_GET_ORDER_DETAILS } from '../Config/UrlsConfig';

export const GetAllOrderDetailsAction = async ({
  page      = 1,
  limit     = 10,
  card,        // ← card filter for summary cards (accepted, upcoming, etc.)
  status,      // ← optional status filter
  startdate,
  enddate,
  search,
} = {}) => {
  const params = new URLSearchParams();

  params.set('page',  page);
  params.set('limit', limit);

  // card param maps to summary card clicks
  if (card)      params.set('card',      card);
  if (status)    params.set('status',    status);
  if (startdate) params.set('startdate', startdate);
  if (enddate)   params.set('enddate',   enddate);
  if (search)    params.set('search',    search);

  const url = `${URL_ADMIN_GET_ORDER_DETAILS}?${params.toString()}`;

  console.group('📦 [Orders] GET');
  console.log('URL:', url);
  console.log('params:', { page, limit, card, status, startdate, enddate, search });
  console.groupEnd();

  const response = await fetch(url, { method: 'GET' });

  if (!response.ok) throw new Error(`Failed to fetch orders (${response.status})`);

  const data = await response.json();
  if (!data) throw new Error('Invalid response from server');

  console.log('📨 [Orders] Response:', data);
  return data;
};
