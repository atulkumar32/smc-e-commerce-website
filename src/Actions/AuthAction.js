import { URL_LOGIN, URL_REGISTER, URL_ADMIN_LOGIN } from '../Config/UrlsConfig';

export const adminLoginAction = async ({ email, password }) => {
  const response = await fetch(URL_ADMIN_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();
  console.log("📥 Raw response text:", text);

  const data = text ? JSON.parse(text) : {};
  console.log("📦 Parsed API data:", data);

  if (!response.ok || data.status === false) {
    throw new Error(data.message || 'Invalid credentials');
  }

  return data; // ✅ FIXED
};

// ── User login ────────────────────────────────────────────────────────────────
export const userLoginAction = async ({ email, password }) => {
  const response = await fetch(URL_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok || data.status === false) {
    throw new Error(data.message || 'Invalid credentials');
  }
  return data.data ?? data;
};

// ── User register ─────────────────────────────────────────────────────────────
export const registerAction = async (fields) => {
  const response = await fetch(URL_REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok || data.status === false) {
    throw new Error(data.message || 'Registration failed');
  }
  return data.data ?? data;
};
