export default function ForgotPasswordModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="forgot-title">
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-card__close" onClick={onClose} aria-label="Close dialog">
          ✕
        </button>

        <div className="auth-modal-card__icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" width="28" height="28" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>

        <h3 id="forgot-title" className="auth-modal-card__title">Forgot Password?</h3>
        <p className="auth-modal-card__text">
          For security purposes, credentials recovery is currently verified by our dedicated customer desk.
          Contact us with your registered email address and order history:
        </p>

        <div className="auth-modal-card__support-box">
          <div className="auth-modal-card__support-row">
            <span className="auth-modal-card__support-label">Customer Email:</span>
            <a href="mailto:care@shreemahaveercollections.com" className="auth-modal-card__support-link">
              care@shreemahaveercollections.com
            </a>
          </div>
          <div className="auth-modal-card__support-row">
            <span className="auth-modal-card__support-label">Support Helpline:</span>
            <a href="tel:+919876543210" className="auth-modal-card__support-link">
              +91 98765 43210 (Mon–Sat, 10 AM – 7 PM)
            </a>
          </div>
        </div>

        <button type="button" className="auth-btn auth-btn--primary" onClick={onClose}>
          Got it, Close
        </button>
      </div>
    </div>
  );
}

