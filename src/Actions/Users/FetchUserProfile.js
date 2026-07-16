/**
 * FetchUserProfile.js  —  used by Profile page only
 *
 * All requests POST with JSON body { user_id, email, ...fields }
 * Also X-USER-ID header.
 */

import { USER_APIS } from '../../Config/UrlsConfig';

export function getProfileCredentials() {
  try {
    const p = JSON.parse(localStorage.getItem('user_profile') || '{}');
    return {
      user_id: p.user_id ?? p.id    ?? p.userId    ?? null,
      email:   p.email   ?? p.Email ?? p.userEmail ?? '',
      name:    p.name    ?? p.full_name ?? p.fullName ?? '',
      token:   localStorage.getItem('user_token') ?? '',
    };
  } catch { return null; }
}

function buildHeaders(creds) {
  return {
    'Content-Type': 'application/json',
    'X-USER-ID':    String(creds.user_id),
    ...(creds.token ? { Authorization: `Bearer ${creds.token}` } : {}),
  };
}

async function parseResponse(res, tag) {
  const text = await res.text();
  console.group(`📨 [${tag}] Response — HTTP ${res.status}`);
  console.log(text.slice(0, 700));
  console.groupEnd();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON */ }
  if (!res.ok || data.status === false) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ── GET profile ────────────────────────────────────────────────────────────────
// POST body: { user_id, email }
export const fetchUserProfileApi = async () => {
  const creds = getProfileCredentials();
  if (!creds?.user_id) throw new Error('Not authenticated — please log in again');

  const body = { user_id: creds.user_id, email: creds.email };

  console.group('📡 [UserProfile] POST', USER_APIS.PROFILE_GET);
  console.log('user_id :', creds.user_id, '| email:', creds.email);
  console.log('body    :', JSON.stringify(body));
  console.groupEnd();

  const res     = await fetch(USER_APIS.PROFILE_GET, {
    method: 'POST', headers: buildHeaders(creds), body: JSON.stringify(body),
  });
  const data    = await parseResponse(res, 'UserProfile');
  const profile = data?.data ?? data?.user ?? data;
  console.log('✅ [UserProfile]', profile);
  return profile;
};

// ── Update profile ─────────────────────────────────────────────────────────────
// POST body: { user_id, email, name, phone, address }
export const updateUserProfileApi = async (fields) => {
  const creds = getProfileCredentials();
  if (!creds?.user_id) throw new Error('Not authenticated — please log in again');

  const body = { user_id: creds.user_id, email: creds.email, ...fields };

  console.group('📡 [UpdateProfile] POST', USER_APIS.PROFILE_UPDATE);
  console.log('user_id :', creds.user_id, '| email:', creds.email);
  console.log('body    :', JSON.stringify(body));
  console.groupEnd();

  const res  = await fetch(USER_APIS.PROFILE_UPDATE, {
    method: 'POST', headers: buildHeaders(creds), body: JSON.stringify(body),
  });
  const data = await parseResponse(res, 'UpdateProfile');

  // Keep localStorage in sync
  try {
    const existing = JSON.parse(localStorage.getItem('user_profile') || '{}');
    localStorage.setItem('user_profile', JSON.stringify({ ...existing, ...fields }));
  } catch { /* ignore */ }

  console.log('✅ [UpdateProfile]', data);
  return data?.data ?? data;
};

// ── Change password ────────────────────────────────────────────────────────────
// POST body: { user_id, email, old_password, new_password }
export const updateUserPasswordApi = async ({ old_password, new_password }) => {
  const creds = getProfileCredentials();
  if (!creds?.user_id) throw new Error('Not authenticated — please log in again');

  const body = { user_id: creds.user_id, email: creds.email, old_password, new_password };

  console.group('📡 [UpdatePassword] POST', USER_APIS.PASSWORD_UPDATE);
  console.log('user_id :', creds.user_id, '| email:', creds.email);
  // Don't log actual passwords
  console.log('body    :', JSON.stringify({ user_id: creds.user_id, email: creds.email,
    old_password: '***', new_password: '***' }));
  console.groupEnd();

  const res  = await fetch(USER_APIS.PASSWORD_UPDATE, {
    method: 'POST', headers: buildHeaders(creds), body: JSON.stringify(body),
  });
  const data = await parseResponse(res, 'UpdatePassword');
  console.log('✅ [UpdatePassword]', data?.message || 'OK');
  return data;
};
