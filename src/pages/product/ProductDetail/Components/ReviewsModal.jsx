/**
 * Components/ReviewsModal.jsx
 *
 * Two modes controlled by `mode` prop:
 *   "reviews" — shows all reviews list (lazy-loaded)
 *   "write"   — shows the write-a-review form directly
 *
 * Customer submit payload:
 *   { product_id, user_name, user_email, user_mobile,
 *     rating, review_text, review_from: 0, status: 0 }
 *
 *   review_from: 0 = customer  (status defaults to 0 = inactive)
 *   review_from: 1 = admin     (status defaults to 1 = active)
 */

import { useState, useEffect } from 'react';
import { useProductReviews }   from '../ProductDetailsData';
import { URL_SAVE_REVIEW }     from '../../../../Config/UrlsConfig';

// ── Star picker ───────────────────────────────────────────────────────────────
function StarPicker({ value, onChange, error }) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="rv-field">
      <label className="rv-label">
        Your Rating <span className="rv-req">*</span>
      </label>
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
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
        {(hover || value) > 0 && (
          <span className="rv-form__star-label">{labels[hover || value]}</span>
        )}
      </div>
      {error && <span className="rv-err">{error}</span>}
    </div>
  );
}

// ── Write review form ─────────────────────────────────────────────────────────
const EMPTY = { name: '', email: '', mobile: '', rating: 0, text: '' };

function WriteReviewForm({ productId, onBack, onSubmitted }) {
  const [form,       setForm]       = useState({ ...EMPTY });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);

  const set = (f) => (v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name   = 'Name is required';
    if (!form.rating)       e.rating = 'Please select a rating';
    if (!form.text.trim())  e.text   = 'Review is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email';
    if (form.mobile && !/^\d{10}$/.test(form.mobile.replace(/\s/g, '')))
      e.mobile = 'Enter a valid 10-digit mobile number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(URL_SAVE_REVIEW, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id:   productId,
          user_name:    form.name.trim(),
          user_email:   form.email.trim()  || null,
          user_mobile:  form.mobile.trim() || null,
          rating:       form.rating,
          review_text:  form.text.trim(),
          review_from:  0,   // 0 = customer
          status:       0,   // 0 = inactive until admin approves
          // fields not applicable from customer side
          product_name: null,
          variant_id:   null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status === false || data.status === 'error')
        throw new Error(data.message || data.msg || `HTTP ${res.status}`);
      setDone(true);
      onSubmitted?.();
    } catch (err) {
      setErrors((p) => ({ ...p, _api: err.message || 'Submission failed. Try again.' }));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──
  if (done) {
    return (
      <div className="rv-success">
        <div className="rv-success__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" width="36" height="36">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p className="rv-success__title">Thank you for your review!</p>
        <p className="rv-success__sub">
          Your review has been submitted and will appear after approval.
        </p>
        <button className="rv-btn rv-btn--ghost" onClick={onBack}>
          ← Back to Reviews
        </button>
      </div>
    );
  }

  return (
    <form className="rv-write-form" onSubmit={handleSubmit} noValidate>

      {/* Back link */}
      <button type="button" className="rv-back-btn" onClick={onBack}>
        ← Back to Reviews
      </button>

      <p className="rv-write-form__title">Write a Review</p>
      <p className="rv-write-form__sub">
        Share your honest experience to help other shoppers.
      </p>

      {/* Star picker */}
      <StarPicker value={form.rating} onChange={set('rating')} error={errors.rating} />

      {/* Name */}
      <div className="rv-field">
        <label className="rv-label">
          Full Name <span className="rv-req">*</span>
        </label>
        <input
          className={`rv-input${errors.name ? ' rv-input--err' : ''}`}
          placeholder="e.g. Rahul Sharma"
          value={form.name}
          onChange={(e) => set('name')(e.target.value)}
          maxLength={80}
          autoComplete="name"
        />
        {errors.name && <span className="rv-err">{errors.name}</span>}
      </div>

      {/* Email + Mobile row */}
      <div className="rv-field-row">
        <div className="rv-field">
          <label className="rv-label">Email</label>
          <input
            className={`rv-input${errors.email ? ' rv-input--err' : ''}`}
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => set('email')(e.target.value)}
            maxLength={120}
            autoComplete="email"
          />
          {errors.email && <span className="rv-err">{errors.email}</span>}
        </div>
        <div className="rv-field">
          <label className="rv-label">Mobile Number</label>
          <input
            className={`rv-input${errors.mobile ? ' rv-input--err' : ''}`}
            type="tel"
            placeholder="10-digit mobile"
            value={form.mobile}
            onChange={(e) => set('mobile')(e.target.value.replace(/\D/g, '').slice(0, 10))}
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
          />
          {errors.mobile && <span className="rv-err">{errors.mobile}</span>}
        </div>
      </div>

      {/* Review text */}
      <div className="rv-field">
        <label className="rv-label">
          Your Review <span className="rv-req">*</span>
        </label>
        <textarea
          className={`rv-input rv-input--textarea${errors.text ? ' rv-input--err' : ''}`}
          placeholder="Tell others what you liked or didn't like about this product…"
          value={form.text}
          onChange={(e) => set('text')(e.target.value)}
          rows={4}
          maxLength={800}
        />
        <div className="rv-field__count">{form.text.length} / 800</div>
        {errors.text && <span className="rv-err">{errors.text}</span>}
      </div>

      {errors._api && (
        <div className="rv-err rv-err--block">{errors._api}</div>
      )}

      {/* Actions */}
      <div className="rv-write-form__actions">
        <button type="button" className="rv-btn rv-btn--ghost" onClick={onBack}>
          Cancel
        </button>
        <button type="submit" className="rv-btn rv-btn--primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>

    </form>
  );
}

// ── Reviews list view ─────────────────────────────────────────────────────────
function ReviewsList({ reviews, loading, error, avgRating, totalReviews }) {
  const fmt = (n) => Number(n || 0).toFixed(1);
  return (
    <>
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
    </>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
/**
 * @param {object} props
 * @param {string}  props.productId
 * @param {number}  props.totalReviews
 * @param {number}  props.avgRating
 * @param {'reviews'|'write'} props.mode  — which view to open first
 * @param {function} props.onClose
 */
export default function ReviewsModal({
  productId, totalReviews, avgRating, mode = 'reviews', onClose,
}) {
  const { reviews, loading, error, fetchReviews } = useProductReviews(productId);
  const [view, setView] = useState(mode); // 'reviews' | 'write'

  const fmt = (n) => Number(n || 0).toFixed(1);

  // Lazy-fetch reviews only when the reviews view is shown for the first time
  useEffect(() => {
    if (view === 'reviews') fetchReviews();
  }, [view, fetchReviews]);

  return (
    <div
      className="rv-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={view === 'write' ? 'Write a review' : 'Customer reviews'}
    >
      <div className="rv-modal__box rv-modal__box--lg" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="rv-modal__head">
          <div>
            <p className="rv-modal__title">
              {view === 'write' ? 'Write a Review' : 'Customer Reviews'}
            </p>
            {view === 'reviews' && (
              <div className="rv-modal__summary">
                <span className="rv-modal__avg">{fmt(avgRating)}</span>
                <span className="rv-modal__stars">
                  {[1,2,3,4,5].map((n) => (
                    <svg key={n} width="14" height="14" viewBox="0 0 24 24"
                      fill={avgRating >= n ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </span>
                <span className="rv-modal__count">
                  {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          <button className="rv-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="rv-modal__body">
          {view === 'reviews' ? (
            <ReviewsList
              reviews={reviews} loading={loading} error={error}
              avgRating={avgRating} totalReviews={totalReviews}
            />
          ) : (
            <WriteReviewForm
              productId={productId}
              onBack={() => setView('reviews')}
              onSubmitted={() => { /* stay on success screen */ }}
            />
          )}
        </div>

        {/* ── Footer — only shown on reviews view ── */}
        {view === 'reviews' && (
          <div className="rv-modal__footer">
            <button
              className="rv-modal__add-btn"
              onClick={() => setView('write')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" width="15" height="15">
                <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
                <path d="M17.5 2.5a2.121 2.121 0 0 1 3 3L12 14l-4 1 1-4 8.5-8.5z" />
              </svg>
              Write a Review
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
