// ============================================================
//  SHARED VALIDATION UTILITIES
//  Import anywhere: import { required, email, phone, ... } from '@/utils/validators'
// ============================================================

// ── Primitives ────────────────────────────────────────────────────────────────

export const required = (value, label = 'Field') => {
  if (value === null || value === undefined) return `${label} is required`;
  if (typeof value === 'string' && !value.trim()) return `${label} is required`;
  if (Array.isArray(value) && value.length === 0) return `${label} is required`;
  return null;
};

export const minLength = (min) => (value, label = 'Field') => {
  if (!value) return null; // let required handle empty
  return String(value).trim().length >= min
    ? null
    : `${label} must be at least ${min} characters`;
};

export const maxLength = (max) => (value, label = 'Field') => {
  if (!value) return null;
  return String(value).trim().length <= max
    ? null
    : `${label} must be no more than ${max} characters`;
};

export const email = (value, label = 'Email') => {
  if (!value) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? null
    : `${label} must be a valid email address`;
};

export const phone = (value, label = 'Phone') => {
  if (!value) return null;
  return /^\d{10}$/.test(value.replace(/\s/g, ''))
    ? null
    : `${label} must be a valid 10-digit number`;
};

export const pinCode = (value, label = 'PIN Code') => {
  if (!value) return null;
  return /^\d{6}$/.test(value.replace(/\s/g, ''))
    ? null
    : `${label} must be a 6-digit PIN code`;
};

export const numeric = (value, label = 'Field') => {
  if (!value && value !== 0) return null;
  return !Number.isNaN(Number(value)) ? null : `${label} must be a number`;
};

export const min = (minimum) => (value, label = 'Field') => {
  if (!value && value !== 0) return null;
  return Number(value) >= minimum
    ? null
    : `${label} must be at least ${minimum}`;
};

export const max = (maximum) => (value, label = 'Field') => {
  if (!value && value !== 0) return null;
  return Number(value) <= maximum
    ? null
    : `${label} must be no more than ${maximum}`;
};

export const positiveNumber = (value, label = 'Field') => {
  const n = Number(value);
  return !Number.isNaN(n) && n > 0 ? null : `${label} must be a positive number`;
};

export const url = (value, label = 'URL') => {
  if (!value) return null;
  try {
    new URL(value);
    return null;
  } catch {
    return `${label} must be a valid URL`;
  }
};

// ── Composer — run multiple rules, return first error ─────────────────────────
export const compose = (...rules) => (value, label) => {
  for (const rule of rules) {
    const err = rule(value, label);
    if (err) return err;
  }
  return null;
};

// ── Password ──────────────────────────────────────────────────────────────────
export const password = (value, label = 'Password') => {
  if (!value) return `${label} is required`;
  if (value.length < 8) return `${label} must be at least 8 characters`;
  if (!/[A-Z]/.test(value)) return `${label} must contain an uppercase letter`;
  if (!/[0-9]/.test(value)) return `${label} must contain a number`;
  return null;
};

export const confirmPassword = (original) => (value, label = 'Confirm Password') => {
  if (!value) return `${label} is required`;
  return value === original ? null : 'Passwords do not match';
};

// ── Password strength score (0–5) ─────────────────────────────────────────────
export const passwordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '#e0e0e0' };
  let s = 0;
  if (pw.length >= 8)           s++;
  if (pw.length >= 12)          s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  const MAP = [
    null,
    { pct: 20, label: 'Weak',       color: '#ef5350' },
    { pct: 40, label: 'Fair',       color: '#ffa726' },
    { pct: 60, label: 'Good',       color: '#29b6f6' },
    { pct: 80, label: 'Strong',     color: '#66bb6a' },
    { pct: 100, label: 'Very Strong', color: '#00c853' },
  ];
  return MAP[s] ?? MAP[1];
};

// ─────────────────────────────────────────────────────────────────────────────
//  DOMAIN-SPECIFIC VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

// ── Register form ─────────────────────────────────────────────────────────────
export function validateRegisterForm(form) {
  const e = {};
  const r = (f, l, ...rules) => {
    const err = compose(required, ...rules)(form[f], l);
    if (err) e[f] = err;
  };

  r('first_name',        'First Name',    minLength(2));
  r('last_name',         'Last Name',     minLength(2));
  r('email',             'Email',         email);
  r('phone_number',      'Phone',         phone);
  r('city',              'City');
  r('state',             'State');
  r('country',           'Country');
  r('landmark_address',  'Address',       minLength(5));

  const pwErr = password(form.password, 'Password');
  if (pwErr) e.password = pwErr;

  if (!form.confirm_password) {
    e.confirm_password = 'Please confirm your password';
  } else if (form.password !== form.confirm_password) {
    e.confirm_password = 'Passwords do not match';
  }

  return e;
}

// ── Login form ────────────────────────────────────────────────────────────────
export function validateLoginForm(form) {
  const e = {};
  if (!form.email?.trim()) e.email = 'Email is required';
  else if (email(form.email)) e.email = email(form.email, 'Email');
  if (!form.password) e.password = 'Password is required';
  return e;
}

// ── Checkout — shipping step ──────────────────────────────────────────────────
export function validateShipping(data) {
  const e = {};
  const r = (f, l, ...rules) => {
    const err = compose(required, ...rules)(data[f], l);
    if (err) e[f] = err;
  };

  r('firstName', 'First Name',   minLength(2));
  r('lastName',  'Last Name',    minLength(2));
  r('address',   'Address',      minLength(5));
  r('city',      'City',         minLength(2));
  r('state',     'State',        minLength(2));
  r('zip',       'PIN Code',     pinCode);
  r('phone',     'Phone Number', phone);

  return e;
}

// ── Product form (admin) ──────────────────────────────────────────────────────
export function validateProductForm(form, mode = 'publish') {
  const e = {};

  if (!form.images || form.images.length < 1) {
    e.images = 'Upload at least 1 product image';
  }

  if (mode === 'draft') return e; // only images required for draft

  const r = (f, l, ...rules) => {
    const err = compose(required, ...rules)(form[f], l);
    if (err) e[f] = err;
  };

  r('productName',  'Product Name',   minLength(3));
  r('brand',        'Brand');
  r('categoryId',   'Category');
  r('mrpPrice',     'MRP',            positiveNumber);
  r('sellingPrice', 'Selling Price',  positiveNumber);
  r('stock',        'Stock',          min(1));
  r('fullDescription', 'Full Description', minLength(10));

  if (!form.selectedColors || form.selectedColors.length === 0) {
    e.selectedColors = 'Select at least one color';
  }

  if (form.discountPercent !== '' && form.discountPercent != null) {
    const pct = Number(form.discountPercent);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      e.discountPercent = 'Discount must be 0–100%';
    }
  }

  return e;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
