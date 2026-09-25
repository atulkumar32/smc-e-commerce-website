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
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error('[userLoginAction] JSON parse error:', err, 'Raw text:', text);
  }

  if (
    !response.ok ||
    data.status === false ||
    data.status === 'false' ||
    data.success === false ||
    data.success === 'false'
  ) {
    throw new Error(data.message || data.error || 'Invalid email or password');
  }

  const payload = data.data
    ? typeof data.data === 'object'
      ? { ...data, ...data.data }
      : data.data
    : data.user
      ? { ...data, ...data.user }
      : data;

  return payload;
};

// ── User register ─────────────────────────────────────────────────────────────
export const registerAction = async (fields) => {
  // console.log("ACTION DATA : ",fields)
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
