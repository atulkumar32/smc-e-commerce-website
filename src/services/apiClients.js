const ADMIN_LOGGED_IN_KEY = 'admin_logged_in';
const ADMIN_USER_KEY = 'admin_user';
const ADMIN_TOKEN_KEY = 'admin_token';

const USER_LOGGED_IN_KEY = 'user_logged_in';
const USER_PROFILE_KEY = 'user_profile';
const USER_TOKEN_KEY = 'user_token';

export function isAdminAuthenticated() {
  return localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true';
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminUser() {
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Unable to parse admin user from localStorage', err);
    return null;
  }
}

export function saveAdminAuth(payload) {
  if (!payload || payload.status !== true) {
    return false;
  }

  const adminData = payload.data ?? payload;
  if (!adminData) {
    return false;
  }

  localStorage.setItem(ADMIN_LOGGED_IN_KEY, 'true');
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminData));

  if (adminData.token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, adminData.token);
  } else if (adminData.id) {
    localStorage.setItem(ADMIN_TOKEN_KEY, String(adminData.id));
  }

  return true;
}

export function clearAdminAuth() {
  localStorage.removeItem(ADMIN_LOGGED_IN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getAdminHeaders(additional = {}) {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...additional,
  };
}

export async function fetchAdminApi(url, options = {}) {
  const headers = getAdminHeaders(options.headers);
  return fetch(url, { ...options, headers });
}

export function isUserAuthenticated() {
  const loggedInFlag = localStorage.getItem(USER_LOGGED_IN_KEY) === 'true';
  const token = localStorage.getItem(USER_TOKEN_KEY);
  // token is optional for now, so rely on the logged-in flag
  return loggedInFlag || Boolean(token);
}


export function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function getUserProfile() {
  const raw = localStorage.getItem(USER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Unable to parse user profile from localStorage', err);
    return null;
  }
}

export function saveUserAuth(payload) {
  if (!payload) {
    return false;
  }

  const userData = payload.user ?? payload.data ?? payload;
  if (!userData) {
    return false;
  }

  localStorage.setItem(USER_LOGGED_IN_KEY, 'true');
  // Use token if provided, otherwise fallback to user ID or email
  const token = userData.token || userData.id || userData.email || 'user_session';
  localStorage.setItem(USER_TOKEN_KEY, String(token));
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userData));
  return true;
}

export function clearUserAuth() {
  localStorage.removeItem(USER_LOGGED_IN_KEY);
  localStorage.removeItem(USER_PROFILE_KEY);
  localStorage.removeItem(USER_TOKEN_KEY);
}

export function getUserHeaders(additional = {}) {
  const token = getUserToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...additional,
  };
}

export async function fetchUserApi(url, options = {}) {
  const headers = getUserHeaders(options.headers);
  return fetch(url, { ...options, headers });
}
