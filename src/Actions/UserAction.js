import api from '../services/api';
import { URL_USERS_FETCH } from '../Config/UrlsConfig';
import { getUserProfile } from '../services/apiClients';


/**
 * Fetch paginated + optionally searched users.
 *
 * @param {object} params
 * @param {number} params.page      - 1-based page number
 * @param {number} params.perPage   - rows per page
 * @param {string} params.search    - name / email search term (optional)
 *
 * @returns {{ users: [], totalRecords: number, totalPages: number, page: number, perPage: number }}
 */
export const fetchUsersAction = async ({ page = 1, perPage = 10, search = '' } = {}) => {
  const url = new URL(URL_USERS_FETCH);
  url.searchParams.set('page', page);
  url.searchParams.set('perPage', perPage);
  if (search.trim()) url.searchParams.set('search', search.trim());

  const response = await fetch(url.toString(), { method: 'GET' });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok || data.status === false) {
    throw new Error(data.message || 'Failed to load users');
  }

  // API: { status, data: { users: [...], page, perPage, totalRecords, totalPages } }
  const payload = data.data ?? {};
  return {
    users: payload.users ?? [],
    totalRecords: payload.totalRecords ?? 0,
    totalPages: payload.totalPages ?? 1,
    page: payload.page ?? page,
    perPage: payload.perPage ?? perPage,
  };
};

export const fetchCurrentUserProfile = async () => {
  const response = await api.getUserProfile();
  const data = response?.data ?? response;
  if (!data) {
    throw new Error('Unable to load profile');
  }
  return data;
};

export const updateCurrentUserProfile = async (payload) => {
  const response = await api.updateUserProfile(payload);
  return response?.data ?? response;
};

export const fetchCurrentUserOrders = async () => {
  const profile = getUserProfile();
  const userId = profile?.user_id ?? profile?.id ?? profile?.userId;

  if (!userId) {
    throw new Error('Missing user_id (send X-USER-ID header)');
  }

  const response = await api.getUserOrders({
    headers: { 'X-USER-ID': String(userId) },
  });

  const data = response?.data ?? response;
  if (Array.isArray(data)) {
    return data;
  }
  return data?.orders ?? [];
};

