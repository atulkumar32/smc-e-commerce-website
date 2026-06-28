import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import './style.scss';

function PaymentSuccessPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const orderId = state?.orderId  || '—';
  const message = state?.message  || 'Your payment was successful!';

  useEffect(() => {
    toast.success('🎉 Payment successful! Your order is confirmed.', {
      position: 'top-right', autoClose: 4000,
    });
  }, []);

  return (
    <div className="pay-success">
      <div className="pay-success__card">
        {/* Success icon */}
        <div className="pay-success__icon" aria-hidden="true">
          <svg viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#00c853" strokeWidth="3" fill="#f0fff4"/>
            <polyline points="22,42 36,56 58,28"
              stroke="#00c853" strokeWidth="4.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="pay-success__title">Payment Successful</h1>
        <p className="pay-success__msg">{message}</p>

        {orderId !== '—' && (
          <div className="pay-success__order-box">
            <span className="pay-success__order-label">Order ID</span>
            <span className="pay-success__order-id">{orderId}</span>
          </div>
        )}

        <p className="pay-success__hint">
          A confirmation will be sent to your registered contact.
          Your order will be shipped within 1–2 business days.
        </p>

        <div className="pay-success__actions">
          <Link to="/user/orders" className="pay-success__btn pay-success__btn--primary">
            View My Orders
          </Link>
          <Link to="/" className="pay-success__btn pay-success__btn--outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
