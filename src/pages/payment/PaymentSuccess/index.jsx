import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import './style.scss';

function PaymentSuccessPage() {
  const { state } = useLocation();

  const orderId = state?.orderId || '';
  const message = state?.message || 'Your payment was successful!';

  useEffect(() => {
    toast.success('🎉 Order confirmed! Thank you for your purchase.', {
      position: 'top-right', autoClose: 4000,
    });
  }, []);

  return (
    <div className="pay-result pay-result--success">
      {/* Background decoration */}
      <div className="pay-result__bg" aria-hidden="true">
        <div className="pay-result__bg-circle pay-result__bg-circle--1" />
        <div className="pay-result__bg-circle pay-result__bg-circle--2" />
      </div>

      <div className="pay-result__card">
        {/* Animated checkmark */}
        <div className="pay-result__icon-wrap pay-result__icon-wrap--success">
          <svg className="pay-result__checkmark" viewBox="0 0 52 52" fill="none">
            <circle className="pay-result__checkmark-circle" cx="26" cy="26" r="25"
              fill="none" stroke="#00c853" strokeWidth="2"/>
            <polyline className="pay-result__checkmark-check"
              points="14,27 22,35 38,17"
              fill="none" stroke="#00c853" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="pay-result__badge pay-result__badge--success">
          Payment Successful
        </div>

        <h1 className="pay-result__title">Your Order is Confirmed!</h1>
        <p className="pay-result__msg">{message}</p>

        {orderId && (
          <div className="pay-result__order-box">
            <div className="pay-result__order-row">
              <span className="pay-result__order-label">Order ID</span>
              <span className="pay-result__order-val">{orderId}</span>
            </div>
            <div className="pay-result__order-row">
              <span className="pay-result__order-label">Status</span>
              <span className="pay-result__order-val pay-result__order-val--green">
                ✅ Confirmed
              </span>
            </div>
          </div>
        )}

        <div className="pay-result__info-card">
          <div className="pay-result__info-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <rect x="1" y="3" width="15" height="13" rx="1"/>
              <path d="M16 8h4l3 5v3h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span>Delivery within <strong>3–5 business days</strong></span>
          </div>
          <div className="pay-result__info-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>Confirmation sent to your registered contact</span>
          </div>
        </div>

        <div className="pay-result__actions">
          <Link to="/user/orders" className="pay-result__btn pay-result__btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="2"/>
            </svg>
            View My Orders
          </Link>
          <Link to="/home" className="pay-result__btn pay-result__btn--outline">
            Continue Shopping
          </Link>
        </div>

        <p className="pay-result__footer-note">
          Need help? <Link to="/contact" className="pay-result__footer-link">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
