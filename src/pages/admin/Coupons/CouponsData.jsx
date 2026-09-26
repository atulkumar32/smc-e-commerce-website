/**
 * CouponsData.jsx — data layer for the Coupons admin page.
 *
 * API shapes:
 *   POST AddNewCoupans.php   — create coupon
 *   GET  get_all_coupons.php — list (supports ?search=&start_date=&end_date=)
 *   POST DeleteCoupon.php    — delete coupon
 *   POST UpdateCoupon.php    — update coupon
 *   GET  GetUsers.php        — user list { success, total, data:[{id,email,full_name}] }
 */

import { useState, useEffect, useCallback } from 'react';
import { toast }                             from 'react-toastify';
import {
  URL_COUPONS_CREATE,
  URL_COUPONS_LIST,
  URL_COUPONS_DELETE,
  URL_COUPONS_UPDATE,
  URL_PRODUCTS_FETCH,
  URL_ADMIN_USERS,
} from '../../../Config/UrlsConfig';

// ── Discount % options 1–100 ──────────────────────────────────
export const PERCENT_OPTIONS = Array.from({ length: 100 }, (_, i) => ({
  label: `${i + 1}%`,
  value: i + 1,
}));

// ── Empty form shape matching AddNewCoupans.php request ───────
export const EMPTY_COUPON = {
  id:               null,    // for edit mode
  coupon_code:      '',
  discount_percent: '',
  min_order_amount: '',
  max_uses:         '',
  expiry_date:      '',
  is_active:        1,
  product_ids:      [],      // numeric product ids
  user_ids:         [],      // numeric user ids
  user_emails:      [],      // string emails (filled automatically from selected users)
};

// ── Shared fetch helper ───────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res  = await fetch(url, options);
  const text = await res.text();
  let data   = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* ignore */ }
  if (!res.ok || data.success === false || data.status === false || data.status === 'error')
    throw new Error(data.message || data.msg || `HTTP ${res.status}`);
  return data;
}

// ── Validation ────────────────────────────────────────────────
function validateCoupon(form) {
  const e = {};
  if (!form.coupon_code?.trim())
    e.coupon_code = 'Coupon code is required';
  else if (!/^[A-Z0-9_-]{2,30}$/i.test(form.coupon_code.trim()))
    e.coupon_code = 'Code must be 2–30 chars (letters, numbers, - _)';

  const pct = Number(form.discount_percent);
  if (!form.discount_percent && form.discount_percent !== 0)
    e.discount_percent = 'Discount % is required';
  else if (isNaN(pct) || pct < 1 || pct > 100)
    e.discount_percent = 'Must be between 1 and 100';

  if (form.min_order_amount && Number(form.min_order_amount) < 0)
    e.min_order_amount = 'Cannot be negative';

  if (form.max_uses && (isNaN(Number(form.max_uses)) || Number(form.max_uses) < 1))
    e.max_uses = 'Must be at least 1';

  if (form.expiry_date) {
    const d = new Date(form.expiry_date);
    if (isNaN(d.getTime())) e.expiry_date = 'Invalid date';
  }

  return e;
}

// ── Actions ───────────────────────────────────────────────────

/** POST AddNewCoupans.php */
export const createCouponAction = (payload) =>
  apiFetch(URL_COUPONS_CREATE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

/** POST UpdateCoupon.php */
export const updateCouponAction = (payload) =>
  apiFetch(URL_COUPONS_UPDATE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

/** POST DeleteCoupon.php */
export const deleteCouponAction = (id) =>
  apiFetch(URL_COUPONS_DELETE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ id }),
  });

// ── Hook: coupon list — supports search + date filter ─────────
export function useCouponsList() {
  const [coupons,    setCoupons]    = useState([]);
  const [summary,    setSummary]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');

  const load = useCallback(async (opts = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      const s  = opts.search     ?? search;
      const sd = opts.startDate  ?? startDate;
      const ed = opts.endDate    ?? endDate;
      if (s)  params.set('search',     s);
      if (sd) params.set('start_date', sd);
      if (ed) params.set('end_date',   ed);

      const url  = `${URL_COUPONS_LIST}${params.toString() ? '?' + params : ''}`;
      const data = await apiFetch(url);

      // Response: { success, summary:{...}, data:[...], total_records, ... }
      const list = Array.isArray(data.data) ? data.data : [];
      setCoupons(list);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err.message);
      setCoupons([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;
    try {
      await deleteCouponAction(id);
      toast.success('Coupon deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return {
    coupons, summary, loading, error,
    search, setSearch,
    startDate, setStartDate,
    endDate, setEndDate,
    refetch: load, remove,
  };
}

// ── Hook: products + users for selectors ──────────────────────
export function useProductsAndUsers(enabled = true) {
  const [products, setProducts] = useState([]);
  const [users,    setUsers]    = useState([]);

  useEffect(() => {
    if (!enabled) return;

    // Products
    fetch(`${URL_PRODUCTS_FETCH}?per_page=200`)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data
                   : Array.isArray(d.products) ? d.products : [];
        setProducts(list);
      })
      .catch(() => {});

    // Users — GetUsers.php returns { success, total, data:[{id,email,full_name}] }
    fetch(URL_ADMIN_USERS)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data : [];
        setUsers(list);
      })
      .catch(() => {});
  }, [enabled]);

  return { products, users };
}

// ── Hook: coupon form ──────────────────────────────────────────
export function useCouponForm({ onSuccess } = {}) {
  const [form,   setForm]   = useState({ ...EMPTY_COUPON });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  /** Toggle a product_id in/out of product_ids array */
  const toggleProduct = (productId) => {
    setForm(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter(id => id !== productId)
        : [...prev.product_ids, productId],
    }));
  };

  /** Toggle a user — updates both user_ids and user_emails */
  const toggleUser = (user) => {
    setForm(prev => {
      const already = prev.user_ids.includes(user.id);
      return {
        ...prev,
        user_ids:    already ? prev.user_ids.filter(id => id !== user.id)    : [...prev.user_ids, user.id],
        user_emails: already ? prev.user_emails.filter(e => e !== user.email) : [...prev.user_emails, user.email],
      };
    });
  };

  /** Pre-fill for edit mode */
  const prefill = (row) => {
    setForm({
      id:               row.id,
      coupon_code:      row.coupon_code      || row.code         || '',
      discount_percent: row.discount_percent || '',
      min_order_amount: row.min_order_amount || '',
      max_uses:         row.max_uses         || '',
      expiry_date:      row.expiry_date      ? row.expiry_date.slice(0, 10) : '',
      is_active:        Number(row.is_active ?? row.status ?? 1),
      product_ids:      Array.isArray(row.product_ids) ? row.product_ids : [],
      user_ids:         Array.isArray(row.user_ids)    ? row.user_ids    : [],
      user_emails:      Array.isArray(row.user_emails) ? row.user_emails : [],
    });
    setErrors({});
  };

  const reset = () => { setForm({ ...EMPTY_COUPON }); setErrors({}); };

  const handleSave = async () => {
    const e = validateCoupon(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      // Build payload matching AddNewCoupans.php request body
      const payload = {
        coupon_code:      form.coupon_code.trim().toUpperCase(),
        discount_percent: Number(form.discount_percent),
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : 0,
        max_uses:         form.max_uses         ? Number(form.max_uses)         : null,
        expiry_date:      form.expiry_date      || null,
        is_active:        form.is_active,
        product_ids:      form.product_ids,
        user_ids:         form.user_ids,
        user_emails:      form.user_emails,
        // admin identity (from localStorage or defaults)
        created_by_user_id: 1,
        created_by_email:   'admin@shreemahaveer.in',
      };

      if (form.id) {
        await updateCouponAction({ ...payload, id: form.id });
        toast.success('✅ Coupon updated!', { autoClose: 3000 });
      } else {
        await createCouponAction(payload);
        toast.success('✅ Coupon created!', { autoClose: 3000 });
      }
      reset();
      onSuccess?.();
    } catch (err) {
      toast.error(`❌ ${err.message || 'Save failed'}`, { autoClose: 5000 });
    } finally {
      setSaving(false);
    }
  };

  return {
    form, set, prefill, reset, errors, saving, handleSave,
    toggleProduct, toggleUser,
    isEdit: Boolean(form.id),
  };
}
