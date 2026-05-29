import { getUserProfile } from '../services/apiClients';
import { URL_USER_ORDERS_FETCH } from '../Config/UrlsConfig';

/**
 * Fetch all orders for the current user with user_id
 * @returns {Promise<Array>} Array of user orders
 */
export const fetchUserOrders = async () => {
  const profile = getUserProfile();
  const userId = profile?.user_id ?? profile?.id ?? profile?.userId;

  if (!userId) {
    throw new Error('Missing user_id - User must be authenticated');
  }

  const response = await fetch(URL_USER_ORDERS_FETCH, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-USER-ID': String(userId),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data?.data ?? data?.orders ?? [];
};
