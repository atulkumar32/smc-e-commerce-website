/**
 * UserAddressActions.js — Save & list a user's shipping addresses
 *
 * Endpoints (smc/user/api/):
 *   SaveUserAddress.php     — POST { user_id, full_name, user_email, phone,
 *                                    address_line1, address_line2, city, state,
 *                                    pincode, country, address_type, is_default }
 *   GetUserAddressList.php  — POST { user_id, email }
 *                              ⚠ Endpoint name assumed (not provided by backend yet) —
 *                              update ADDRESS_LIST in UrlsConfig.js if the real
 *                              listing endpoint has a different name.
 */

import { USER_APIS } from '../../Config/UrlsConfig';
import { getProfileCredentials } from './FetchUserProfile';

function buildHeaders(creds) {
  return {
    'Content-Type': 'application/json',
    ...(creds?.token ? { Authorization: `Bearer ${creds.token}` } : {}),
  };
}

async function parseResponse(res, tag) {
  const text = await res.text();
  // console.group(`📨 [${tag}] Response — HTTP ${res.status}`);
  // console.log(text.slice(0, 700));
  // console.groupEnd();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON */ }
  if (!res.ok || data.status === false) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ── Fetch saved addresses ───────────────────────────────────────────────────
// GET  GetUserAddresses.php?user_id=15  (simple GET — no preflight needed)
export const fetchUserAddressesApi = async () => {
  const creds = getProfileCredentials();
  if (!creds?.user_id) throw new Error('Not authenticated — please log in again');

  const url = `${USER_APIS.ADDRESS_LIST}?user_id=${encodeURIComponent(creds.user_id)}`;

  // console.group('📡 [UserAddressList] GET', url);
  // console.groupEnd();

  const res  = await fetch(url, {
    method: 'GET',
    headers: creds?.token ? { Authorization: `Bearer ${creds.token}` } : {},
  });
  const data = await parseResponse(res, 'UserAddressList');
  const list = data?.data ?? data?.addresses ?? data?.address_list ?? data;
  // console.log('✅ [UserAddressList]', list);
  return Array.isArray(list) ? list : [];
};

// ── Save (add) a new address ────────────────────────────────────────────────
export const saveUserAddressApi = async (fields) => {
  const creds = getProfileCredentials();
  if (!creds?.user_id) throw new Error('Not authenticated — please log in again');

  const body = {
    user_id:       creds.user_id,
    full_name:     fields.full_name,
    user_email:    fields.user_email || creds.email,
    phone:         fields.phone,
    address_line1: fields.address_line1,
    address_line2: fields.address_line2 || '',
    city:          fields.city,
    state:         fields.state,
    pincode:       fields.pincode,
    country:       fields.country || 'India',
    address_type:  fields.address_type || 'home',
    is_default:    fields.is_default ? 1 : 0,
  };

  // console.group('📡 [SaveUserAddress] POST', USER_APIS.ADDRESS_SAVE);
  // console.log('body:', JSON.stringify(body));
  // console.groupEnd();

  const res  = await fetch(USER_APIS.ADDRESS_SAVE, {
    method: 'POST', headers: buildHeaders(creds), body: JSON.stringify(body),
  });
  const data = await parseResponse(res, 'SaveUserAddress');
  // console.log('✅ [SaveUserAddress]', data);
  return data?.data ?? data;
};
