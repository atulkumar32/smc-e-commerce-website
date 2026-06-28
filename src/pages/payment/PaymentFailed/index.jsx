import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import './style.scss';

function PaymentFailedPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const orderId = state?.orderId || '';
  const message = state?.message || 'Payment could not be completed. Please try again.';

  useEffect(() => {
    toast.error('❌ Payment failed. Please try again.', {
      position: 'top-right', autoClose: 5000,
    });
  }, []);

  return (
    <div className="pay-result pay-result--failed">
      {/* Background */}
      <div className="pay-result__bg" aria-hidden="true">
        <div className="pay-result__bg-circle pay-result__bg-circle--1" />
        <div className="pay-result__bg-circle pay-result__bg-circle--2" />
      </div>

      <div className="pay-result__card">
        {/* X icon */}
        <div className="pay-result__icon-wrap pay-result__icon-wrap--failed">
          <svg className="pay-result__x-icon" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="25"
              fill="none" stroke="#e53935" strokeWidth="2"/>
            <line x1="16" y1="16" x2="36" y2="36"
              stroke="#e53935" strokeWidth="3"
              strokeLinecap="round"/>
            <line x1="36" y1="16" x2="16" y2="36"
              stroke="#e53935" strokeWidth="3"
              strokeLinecap="round"/>
          </svg>
        </div>

        <div className="pay-result__badge pay-result__badge--failed">
          Payment Failed
        </div>

        <h1 className="pay-result__title">Oops! Something Went Wrong</h1>
        <p className="pay-result__msg">{message}</p>

        {orderId && (
          <div className="pay-result__order-box">
            <div className="pay-result__order-row">
              <span className="pay-result__order-label">Order Reference</span>
              <span className="pay-result__order-val">{orderId}</span>
            </div>
            <div className="pay-result__order-row">
              <span className="pay-result__order-label">Status</span>
              <span className="pay-result__order-val pay-result__order-val--red">
                ❌ Payment Failed
              </span>
            </div>
          </div>
        )}

        {/* Reasons */}
        <div className="pay-result__reasons-card">
          <p className="pay-result__reasons-title">Why did this happen?</p>
          <ul className="pay-result__reasons-list">
            {[
              'Insufficient funds or daily limit exceeded',
              'Payment was cancelled before completion',
              'Bank or UPI declined the transaction',
              'Network timeout during payment processing',
            ].map((r) => (
              <li key={r}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#e53935" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="pay-result__actions">
          <button
            className="pay-result__btn pay-result__btn--primary"
            onClick={() => navigate('/checkout')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
            Try Again
          </button>
          <Link to="/cart" className="pay-result__btn pay-result__btn--outline">
            Return to Cart
          </Link>
        </div>

        <p className="pay-result__footer-note">
          Need help? <Link to="/contact" className="pay-result__footer-link">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}

export default PaymentFailedPage;
