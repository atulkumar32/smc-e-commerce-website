import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import './style.scss';

function PaymentFailedPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const orderId = state?.orderId  || '—';
  const message = state?.message  || 'Payment could not be completed. Please try again.';

  useEffect(() => {
    toast.error(`❌ ${message}`, {
      position: 'top-right', autoClose: 5000,
    });
  }, [message]);

  return (
    <div className="pay-failed">
      <div className="pay-failed__card">
        {/* Failed icon */}
        <div className="pay-failed__icon" aria-hidden="true">
          <svg viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#c62828" strokeWidth="3" fill="#fff5f5"/>
            <line x1="26" y1="26" x2="54" y2="54"
              stroke="#c62828" strokeWidth="4.5"
              strokeLinecap="round"/>
            <line x1="54" y1="26" x2="26" y2="54"
              stroke="#c62828" strokeWidth="4.5"
              strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className="pay-failed__title">Payment Failed</h1>
        <p className="pay-failed__msg">{message}</p>

        {orderId !== '—' && (
          <div className="pay-failed__order-box">
            <span className="pay-failed__order-label">Order Reference</span>
            <span className="pay-failed__order-id">{orderId}</span>
          </div>
        )}

        <div className="pay-failed__reasons">
          <p className="pay-failed__reasons-title">Possible reasons:</p>
          <ul>
            <li>Insufficient funds in your account</li>
            <li>Payment was cancelled</li>
            <li>Bank declined the transaction</li>
            <li>Network timeout during payment</li>
          </ul>
        </div>

        <div className="pay-failed__actions">
          <button
            className="pay-failed__btn pay-failed__btn--primary"
            onClick={() => navigate(-1)}
          >
            ← Try Again
          </button>
          <Link to="/cart" className="pay-failed__btn pay-failed__btn--outline">
            Return to Cart
          </Link>
          <Link to="/contact" className="pay-failed__btn pay-failed__btn--ghost">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailedPage;
