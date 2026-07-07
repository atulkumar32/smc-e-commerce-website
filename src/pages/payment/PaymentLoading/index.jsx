import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkPaymentStatus } from '../../../Actions/Web/PaymentStatus';
import './style.scss';

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS     = 12;

export default function PaymentLoadingPage() {
  const [searchParams]        = useSearchParams();
  const navigate              = useNavigate();

  const [statusMsg, setStatusMsg] = useState('Processing your payment…');
  const [attempt,   setAttempt]   = useState(0);
  const [debugLog,  setDebugLog]  = useState([]);

  // Stable refs — no stale closure issues
  const doneRef      = useRef(false);
  const timerRef     = useRef(null);
  const attemptRef   = useRef(0);

  const merchantOrderId =
    searchParams.get('morderid') ||
    searchParams.get('merchantOrderId') ||
    sessionStorage.getItem('smc_pay_order_id') ||
    '';
    const UserId = searchParams.get["UserId"];

  const addLog = (msg) => {
    const ts = new Date().toLocaleTimeString();
    setDebugLog((prev) => [...prev.slice(-30), `[${ts}] ${msg}`]);
    console.log(msg);
  };

  const doRedirect = (status, msg = '') => {
    if (doneRef.current) return;
    doneRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    addLog(`🚀 Redirecting → ${status}`);

    navigate(status === 'SUCCESS' ? '/payment/success' : '/payment/failed', {
      replace: true,
      state: {
        orderId: merchantOrderId,
        message: msg || (status === 'SUCCESS' ? 'Payment completed successfully' : 'Payment failed'),
        status,
      },
    });
  };

  const pollOnce = async () => {
    if (doneRef.current || !merchantOrderId) return;

    attemptRef.current += 1;
    const n = attemptRef.current;
    setAttempt(n);

    addLog(`🔄 Poll #${n}/${MAX_ATTEMPTS} — orderId: ${merchantOrderId}`);

    try {
      const result = await checkPaymentStatus(merchantOrderId,UserId);

      addLog(`📨 Response: status=${result.status} state=${result.raw?.state || result.raw?.data?.state || '?'}`);
      setDebugLog((prev) => [...prev.slice(-30), `   raw: ${JSON.stringify(result.raw).slice(0, 200)}`]);

      if (result.status === 'SUCCESS') {
        setStatusMsg('Payment Successful! Redirecting…');
        doRedirect('SUCCESS', result.message);
      } else if (result.status === 'FAILED') {
        setStatusMsg(result.message || 'Payment Failed');
        doRedirect('FAILED', result.message);
      } else {
        // PENDING — keep polling
        setStatusMsg(`Verifying… (${n}/${MAX_ATTEMPTS})`);
        if (n >= MAX_ATTEMPTS) {
          doRedirect('FAILED', 'Payment verification timed out. Please contact support.');
        }
      }
    } catch (err) {
      addLog(`❌ Poll error: ${err.message}`);
      if (n >= MAX_ATTEMPTS) {
        doRedirect('FAILED', 'Payment verification timed out.');
      }
    }
  };

  useEffect(() => {
    if (!merchantOrderId) {
      setStatusMsg('Order ID not found. Please check your order status.');
      addLog('⚠️ No merchantOrderId in URL params');
      return;
    }

    addLog(`✅ Started polling for: ${merchantOrderId}`);

    // First poll immediately, then every POLL_INTERVAL_MS
    pollOnce();
    timerRef.current = setInterval(pollOnce, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantOrderId]); // only run once when orderId is known

  const pct = Math.min(100, Math.round((attempt / MAX_ATTEMPTS) * 100));

  return (
    <div className="pay-loading">
      <div className="pay-loading__card">
        {/* Spinner */}
        <div className="pay-loading__spinner-wrap">
          <svg className="pay-loading__ring" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#e0e0e0" strokeWidth="4" />
            <circle
              cx="24" cy="24" r="20" fill="none"
              stroke="#1976d2" strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.4s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          </svg>
          <span className="pay-loading__pct">{pct}%</span>
        </div>

        <h2 className="pay-loading__title">Processing Payment</h2>
        <p className="pay-loading__msg">{statusMsg}</p>

        {merchantOrderId && (
          <p className="pay-loading__order">
            Order: <strong>{merchantOrderId}</strong>
          </p>
        )}

        <p className="pay-loading__attempt">
          Attempt {attempt} / {MAX_ATTEMPTS}
        </p>

        {/* ── Debug log ── */}
        <div className="pay-loading__debug">
          <p className="pay-loading__debug-title">🐛 Debug Log</p>
          {debugLog.length === 0 ? (
            <p className="pay-loading__debug-empty">Waiting for first poll…</p>
          ) : (
            debugLog.map((line, i) => (
              <p key={i} className="pay-loading__debug-line">{line}</p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
