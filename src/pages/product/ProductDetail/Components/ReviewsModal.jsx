/**
 * Components/ReviewsModal.jsx
 *
 * Product reviews modal for the web-facing product detail page.
 *
 * Features:
 *  - Lazy-loads reviews (API called only on first open)
 *  - Shows avg rating + all review cards
 *  - Footer: inline "Add Your Review" form (name, email, star picker, textarea)
 *  - Submit posts to SubmitReview.php
 */

import { useState, useEffect } from 'react';
import { useProductReviews }   from '../ProductDetailsData';
import { URL_SAVE_REVIEW } from '../../../../Config/UrlsConfig';

// ── Star picker ───────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="rv-form__stars" role="group" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n} type="button"
          className={`rv-form__star${(hover || value) >= n ? ' rv-form__star--on' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="rv-form__star-label">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

// ── Submit review form ────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', email: '', rating: 0, text: '' };

function AddReviewForm({ productId, onSubmitted }) {
  const [form,      setForm]      = useState({ ...EMPTY_FORM });
  const [errors,    setErrors]    = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const set = (f) => (v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name   = 'Name is required';
    if (!form.rating)         e.rating = 'Please select a rating';
    if (!form.text.trim())    e.text   = 'Review text is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(URL_SAVE_REVIEW, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id:  productId,
          user_name:   form.name.trim(),
          user_email:  form.email.trim() || null,
          rating:      form.rating,
          review_text: form.text.trim(),
          // admin-only fields left empty / null for customer submissions
          product_name: null,
          variant_id:   null,
          status:       1,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status === false)
        throw new Error(data.message || data.msg || `HTTP ${res.status}`);
      setSubmitted(true);
      setForm({ ...EMPTY_FORM });
      onSubmitted?.();
    } catch (err) {
      setErrors((p) => ({ ...p, _submit: err.message || 'Submission failed' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rv-form rv-form--success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" width="28" height="28">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p>Thank you! Your review has been submitted.</p>
      </div>
    );
  }

  return (
    <form className="rv-form" onSubmit={handleSubmit} noValidate>
      <p className="rv-form__title">Write a Review</p>

      {/* Star rating picker */}
      <div className="rv-form__field">
        <StarPicker value={form.rating} onChange={set('rating')} />
        {errors.rating && <span className="rv-form__err">{errors.rating}</span>}
      </div>

      {/* Name + Email row */}
      <div className="rv-form__row">
        <div className="rv-form__field">
          <input
            className={`rv-form__input${errors.name ? ' rv-form__input--err' : ''}`}
            placeholder="Your name *"
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
            maxLength={80}
          />
          {errors.name && <span className="rv-form__err">{errors.name}</span>}
        </div>
        <div className="rv-form__field">
          <input
            className={`rv-form__input${errors.email ? ' rv-form__input--err' : ''}`}
            type="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={(e) => set('email')(e.target.value)}
            maxLength={120}
          />
          {errors.email && <span className="rv-form__err">{errors.email}</span>}
        </div>
      </div>

      {/* Review text */}
      <div className="rv-form__field">
        <textarea
          className={`rv-form__textarea${errors.text ? ' rv-form__input--err' : ''}`}
          placeholder="Share your experience with this product…"
          value={form.text}
          onChange={(e) => set('text')(e.target.value)}
          rows={3}
          maxLength={800}
        />
        {errors.text && <span className="rv-form__err">{errors.text}</span>}
      </div>

      {errors._submit && (
        <p className="rv-form__err rv-form__err--block">{errors._submit}</p>
      )}

      <button
        type="submit"
        className="rv-form__submit"
        disabled={submitting}
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function ReviewsModal({ productId, totalReviews, avgRating, onClose }) {
  const { reviews, loading, error, fetchReviews } = useProductReviews(productId);
  const [showForm, setShowForm] = useState(false);

  // Fetch only once when modal mounts
  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const fmt = (n) => Number(n || 0).toFixed(1);
  const liveAvg = avgRating;

  return (
    <div
      className="rv-modal" onClick={onClose}
      role="dialog" aria-modal="true" aria-label="Customer reviews"
    >
      <div className="rv-modal__box" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="rv-modal__head">
          <div>
            <p className="rv-modal__title">Customer Reviews</p>
            <div className="rv-modal__summary">
              <span className="rv-modal__avg">{fmt(liveAvg)}</span>
              <span className="rv-modal__stars">
                {[1,2,3,4,5].map((n) => (
                  <svg key={n} width="14" height="14" viewBox="0 0 24 24"
                    fill={liveAvg >= n ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </span>
              <span className="rv-modal__count">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button className="rv-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Reviews list ── */}
        <div className="rv-modal__body">
          {loading && (
            <div className="rv-modal__loading">
              <div className="rv-modal__spinner" />
              <p>Loading reviews…</p>
            </div>
          )}
          {!loading && error && <p className="rv-modal__error">{error}</p>}
          {!loading && !error && reviews.length === 0 && (
            <p className="rv-modal__empty">No reviews yet. Be the first to review!</p>
          )}
          {!loading && reviews.map((r, i) => (
            <div key={r.id ?? i} className="rv-modal__item">
              <div className="rv-modal__item-head">
                <div className="rv-modal__user-info">
                  <span className="rv-modal__avatar">
                    {(r.user_name || 'A')[0].toUpperCase()}
                  </span>
                  <div>
                    <p className="rv-modal__user-name">{r.user_name || 'Anonymous'}</p>
                    {r.created_at && (
                      <p className="rv-modal__date">
                        {new Date(r.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="rv-modal__item-rating">
                  {[1,2,3,4,5].map((n) => (
                    <svg key={n} width="13" height="13" viewBox="0 0 24 24"
                      fill={Number(r.rating) >= n ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                  <span className="rv-modal__item-rating-val">{fmt(r.rating)}</span>
                </div>
              </div>
              {r.review_text && (
                <p className="rv-modal__review-text">{r.review_text}</p>
              )}
            </div>
          ))}
        </div>

        {/* ── Footer — Add Review toggle ── */}
        <div className="rv-modal__footer">
          {!showForm ? (
            <button
              className="rv-modal__add-btn"
              onClick={() => setShowForm(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" width="16" height="16">
                <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
                <path d="M17.5 2.5a2.121 2.121 0 0 1 3 3L12 14l-4 1 1-4 8.5-8.5z" />
              </svg>
              Write a Review
            </button>
          ) : (
            <AddReviewForm
              productId={productId}
              onSubmitted={() => {
                /* keep form visible showing success state */
                fetchReviews(); // no-op if already fetched — guarded by fetched flag
              }}
            />
          )}
        </div>

      </div>
    </div>
  );
}
