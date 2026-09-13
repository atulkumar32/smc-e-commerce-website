/**
 * AddRatingData.jsx
 *
 * Rating form constants, validation, and hook.
 * Supports both CREATE (no id) and EDIT (id present) modes.
 */

import { useState } from 'react';
import { toast }    from 'react-toastify';
import {
  saveReviewAction,
  updateReviewAction,
} from '../../../Actions/GetProductIdToReviewsActions';

// ── Rating options ────────────────────────────────────────────────────────────
// Full range 1.0 → 5.0 in 0.5 steps so any API value can be pre-selected in edit
export const RATING_OPTIONS = [
  1.0, 1.5, 2.0, 2.5, 3.0, 3.5,
  4.0, 4.1, 4.2, 4.3, 4.4, 4.5,
  4.6, 4.7, 4.8, 4.9, 5.0,
];

// ── Status options ────────────────────────────────────────────────────────────
export const STATUS_OPTIONS = [
  { value: 1, label: 'Active',   color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
  { value: 0, label: 'Inactive', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' },
];

// ── Empty form ────────────────────────────────────────────────────────────────
export const EMPTY_RATING_FORM = {
  id:          null,
  product:     null,
  variant:     null,
  rating:      '',
  review_text: '',
  user_name:   '',
  user_email:  '',
  user_mobile: '',
  status:      1,
};

// ── Validation ────────────────────────────────────────────────────────────────
export function validateRatingForm(form) {
  const e = {};
  // product required only in create mode
  if (!form.id && !form.product)        e.product     = 'Please select a product';
  if (!form.rating)                     e.rating      = 'Please select a rating';
  if (!form.review_text?.trim())        e.review_text = 'Review text is required';
  if (!form.user_name?.trim())          e.user_name   = 'Reviewer name is required';
  if (form.user_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.user_email))
    e.user_email = 'Enter a valid email';
  return e;
}

// ── Hook: useRatingForm ───────────────────────────────────────────────────────
/**
 * @param {{ onSuccess?: () => void }} opts
 */
export function useRatingForm({ onSuccess } = {}) {
  const [form,   setForm]   = useState({ ...EMPTY_RATING_FORM });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /** Generic setter; clears variant when product changes */
  const set = (field) => (value) =>
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'product' ? { variant: null } : {}),
    }));

  /** Pre-fill form for edit mode from a reviews table row */
  const prefill = (row) => {
    // Normalise rating: find closest RATING_OPTIONS value so the select shows it
    const rawRating = parseFloat(row.rating) || 0;
    const closest   = RATING_OPTIONS.reduce((prev, cur) =>
      Math.abs(cur - rawRating) < Math.abs(prev - rawRating) ? cur : prev
    );

    setForm({
      id:          row.id,
      product:     { product_id: row.product_id, product_name: row.product_name ?? '', variants: [] },
      variant:     row.variant_id ? { id: null, variant_id: row.variant_id } : null,
      rating:      String(closest),
      review_text: row.review_text ?? '',
      user_name:   row.user_name   ?? '',
      user_email:  row.user_email  ?? '',
      user_mobile: row.user_mobile ?? '',
      status:      Number(row.status ?? 1),
    });
    setErrors({});
  };

  const handleSave = async () => {
    const e = validateRatingForm(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      if (form.id) {
        // ── EDIT ──
        await updateReviewAction({
          id:                  form.id,
          updated_rating:      Number(form.rating),
          updated_text_review: form.review_text.trim(),
          status:              form.status,
        });
        toast.success('✅ Review updated successfully!', { autoClose: 3000 });
      } else {
        // ── CREATE ──
        await saveReviewAction({
          product_id:   form.product.product_id,
          product_name: form.product.product_name,
          variant_id:   form.variant?.variant_id ?? null,
          rating:       Number(form.rating),
          review_text:  form.review_text.trim(),
          user_name:    form.user_name.trim(),
          user_email:   form.user_email?.trim() || null,
          user_mobile:  form.user_mobile?.trim() || null,
          status:       form.status,
          review_from:  1,
        });
        toast.success('✅ Review saved successfully!', { autoClose: 3000 });
      }
      reset();
      onSuccess?.();
    } catch (err) {
      toast.error(`❌ ${err.message || 'Failed to save review'}`, { autoClose: 5000 });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setForm({ ...EMPTY_RATING_FORM }); setErrors({}); };

  const isEditMode = Boolean(form.id);

  return { form, set, prefill, errors, saving, handleSave, reset, isEditMode };
}
