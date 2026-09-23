/**
 * adminValidation.js
 * Shared validation helpers for admin forms.
 */

// ── Coupon form ───────────────────────────────────────────────
export function validateCouponForm(form) {
  const errors = {};

  if (!form.code?.trim())
    errors.code = 'Coupon code is required';
  else if (!/^[A-Z0-9_-]{3,20}$/i.test(form.code.trim()))
    errors.code = 'Code must be 3–20 characters (letters, numbers, - _)';

  if (form.discount_type === 'percentage') {
    const v = Number(form.discount_value);
    if (!form.discount_value && form.discount_value !== 0)
      errors.discount_value = 'Discount value is required';
    else if (isNaN(v) || v < 1 || v > 100)
      errors.discount_value = 'Percentage must be between 1 and 100';
  } else {
    const v = Number(form.discount_value);
    if (!form.discount_value && form.discount_value !== 0)
      errors.discount_value = 'Discount value is required';
    else if (isNaN(v) || v <= 0)
      errors.discount_value = 'Flat discount must be greater than 0';
  }

  if (form.min_order_amount && Number(form.min_order_amount) < 0)
    errors.min_order_amount = 'Min order amount cannot be negative';

  if (form.max_uses && (isNaN(Number(form.max_uses)) || Number(form.max_uses) < 1))
    errors.max_uses = 'Max uses must be at least 1';

  if (form.expires_at) {
    const d = new Date(form.expires_at);
    if (isNaN(d.getTime())) errors.expires_at = 'Invalid date';
    else if (d < new Date()) errors.expires_at = 'Expiry date must be in the future';
  }

  return errors;
}

// ── Mail form ─────────────────────────────────────────────────
export function validateMailForm(form) {
  const errors = {};

  if (!form.subject?.trim())
    errors.subject = 'Subject is required';
  else if (form.subject.trim().length < 3)
    errors.subject = 'Subject must be at least 3 characters';

  if (!form.body?.trim() || form.body.replace(/<[^>]*>/g, '').trim().length < 10)
    errors.body = 'Mail body must be at least 10 characters';

  if (!form.recipients || form.recipients.length === 0)
    errors.recipients = 'Please select at least one recipient group';

  if (form.banner) {
    const MAX_MB = 2;
    if (form.banner.size > MAX_MB * 1024 * 1024)
      errors.banner = `Banner must be under ${MAX_MB}MB`;
    if (!form.banner.type.startsWith('image/'))
      errors.banner = 'Banner must be an image file (JPG, PNG, WebP)';
  }

  return errors;
}
