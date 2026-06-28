import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WEB_URLS } from '../../../Config/UrlsConfig';
import './style.scss';

/**
 * PaymentLoading
 *
 * PhonePe redirects back to this page after the payment attempt.
 * URL will contain: ?merchantOrderId=ORD17815xxxxx (or session-based)
 *
 * We poll  /paymentStatus.php?merchantOrderId=xxx  every 3 s
 * until we get a definitive status or reach the max retry count.
 *
 * Expected API responses:
 *   { status: 'SUCCESS', order_id, message }
 *   { status: 'FAILED',  order_id, message }
 *   { status: 'PENDING', order_id, message }   ← keep polling
 */

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS     = 12;   // 12 × 3 s = 36 s max wait

async function fetchPaymentStatus(merchantOrderId) {
  // Backend uses:
  //   $merchantOrderId = $_SESSION['merchantOrderId'] ?? $_GET['merchantOrderId'] ?? null;
  // So when merchantOrderId is missing on frontend, we call the API WITHOUT query param
  // and let PHP read it from session.
  const url = merchantOrderId
    ? `${WEB_URLS.PAYMENT_STATUS}?merchantOrderId=${encodeURIComponent(merchantOrderId)}`
    : `${WEB_URLS.PAYMENT_STATUS}`;

  const res = await fetch(url, { method: 'GET', credentials: 'include' });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function PaymentLoadingPage() {
  const [searchParams]         = useSearchParams();
  const navigate               = useNavigate();
  const [attempt, setAttempt]  = useState(0);
  const [statusMsg, setStatusMsg] = useState('Verifying your payment…');
  const timerRef               = useRef(null);
  const doneRef                = useRef(false);

  // Grab merchantOrderId from URL — PhonePe appends it as a query param
  const merchantOrderIdFromUrl =
    searchParams.get('merchantOrderId') ||
    searchParams.get('order_id')        ||
    searchParams.get('orderId')         ||
    '';

  // If we already received it once, keep it for a refresh / soft navigation
  // (PHP session is server-side; this is only a frontend fallback).
  if (merchantOrderIdFromUrl) {
    try { sessionStorage.setItem('merchantOrderId', merchantOrderIdFromUrl); } catch {}
  }

  const merchantOrderId = merchantOrderIdFromUrl ||
    (function () {
      try { return sessionStorage.getItem('merchantOrderId') || ''; } catch { return ''; }
    })();

  const redirect = (status, orderId, msg) => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearInterval(timerRef.current);

    const target = status === 'SUCCESS' ? '/payment/success' : '/payment/failed';
    navigate(target, {
      replace: true,
      state: { orderId: orderId || merchantOrderId, message: msg, status },
    });
  };

  const poll = async () => {
    if (doneRef.current) return;

    setAttempt((prev) => {
      const next = prev + 1;

      // If merchantOrderId is missing from frontend, fetchPaymentStatus will call
      // paymentStatus.php WITHOUT query param, letting PHP use $_SESSION.
      fetchPaymentStatus(merchantOrderId)
        .then((data) => {
          const s = (data.status || '').toUpperCase();

          if (s === 'SUCCESS') {
            redirect('SUCCESS', data.order_id, data.message || 'Payment successful!');
          } else if (s === 'FAILED' || s === 'FAILURE' || s === 'ERROR') {
            redirect('FAILED', data.order_id, data.message || 'Payment failed. Please try again.');
          } else if (next >= MAX_ATTEMPTS) {
            // Timed out — treat as failed so user isn't stuck
            redirect('FAILED', data.order_id, 'Payment verification timed out. Please check your orders.');
          } else {
            setStatusMsg(`Still verifying… (${next}/${MAX_ATTEMPTS})`);
          }
        })
        .catch(() => {
          if (next >= MAX_ATTEMPTS) {
            redirect('FAILED', '', 'Could not reach the payment server. Please check your orders.');
          }
        });

      return next;
    });
  };

  useEffect(() => {
    // Start polling immediately then every POLL_INTERVAL_MS
    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      doneRef.current = true;
      clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantOrderId]);

  return (
    <div className="pay-loading">
      <div className="pay-loading__card">
        {/* Spinner */}
        <div className="pay-loading__spinner" aria-hidden="true">
          <svg viewBox="0 0 64 64" className="pay-loading__circle">
            <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4" />
          </svg>
        </div>

        {/* PhonePe brand */}
        <div className="pay-loading__brand">
          <div className="pay-loading__brand-logo">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-label="PhonePe">
              <rect width="36" height="36" rx="8" fill="#5f259f"/>
              <text x="6" y="26" fontSize="17" fontWeight="bold" fill="white">Pe</text>
            </svg>
          </div>
          <span className="pay-loading__brand-text">Secured by PhonePe</span>
        </div>

        <h2 className="pay-loading__title">Processing Payment</h2>
        <p className="pay-loading__msg">{statusMsg}</p>

        {merchantOrderId && (
          <p className="pay-loading__order">
            Order: <strong>{merchantOrderId}</strong>
          </p>
        )}

        {/* Animated progress bar */}
        <div className="pay-loading__progress" role="progressbar" aria-label="Processing">
          <div className="pay-loading__progress-fill" />
        </div>

        <p className="pay-loading__hint">
          Please do not close or refresh this page.
        </p>

        {attempt > 2 && (
          <p className="pay-loading__attempt">
            Check {attempt} of {MAX_ATTEMPTS}…
          </p>
        )}
      </div>
    </div>
  );
}

export default PaymentLoadingPage;
