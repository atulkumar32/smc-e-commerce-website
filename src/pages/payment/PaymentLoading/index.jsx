import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkPaymentStatus } from '../../../Actions/Web/PaymentStatus';
import './style.scss';

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 12;

export default function PaymentLoadingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [statusMsg, setStatusMsg] = useState('Processing your payment...');
  const [attempt, setAttempt] = useState(0);

  const doneRef = useRef(false);
  const timerRef = useRef(null);

  const merchantOrderId = searchParams.get('morderid') || 
                          searchParams.get('merchantOrderId') || 
                          sessionStorage.getItem('smc_pay_order_id') || '';

  const redirect = useCallback((status, msg = '') => {
    if (doneRef.current) return;
    
    doneRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    console.log(`🚀 Redirecting to ${status} page`);

    const path = status === 'SUCCESS' ? '/payment/success' : '/payment/failed';
    
    navigate(path, { 
      replace: true, 
      state: { 
        orderId: merchantOrderId, 
        message: msg || (status === 'SUCCESS' ? 'Payment completed successfully' : 'Payment failed'),
        status 
      } 
    });
  }, [navigate, merchantOrderId]);

  const pollOnce = useCallback(async () => {
    if (doneRef.current || !merchantOrderId) return;

    const n = attempt + 1;
    setAttempt(n);

    console.log(`🔄 Poll #${n}/${MAX_ATTEMPTS}`);

    try {
      const result = await checkPaymentStatus(merchantOrderId);

      if (result.status === 'SUCCESS') {
        setStatusMsg('Payment Successful! Redirecting...');
        redirect('SUCCESS', result.message);
      } else {
        setStatusMsg(result.message || 'Payment Failed');
        redirect('FAILED', result.message);
      }
    } catch (err) {
      console.error('Poll error:', err);
      if (n >= MAX_ATTEMPTS) {
        redirect('FAILED', 'Payment verification timed out.');
      }
    }
  }, [merchantOrderId, redirect, attempt]);

  useEffect(() => {
    if (!merchantOrderId) {
      setStatusMsg('Order ID not found');
      return;
    }

    pollOnce(); // First check
    timerRef.current = setInterval(pollOnce, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pollOnce]);

  return (
    <div className="pay-loading">
      <div className="pay-loading__card">
        <div className="pay-loading__spinner">⭕</div>
        <h2>Processing Payment</h2>
        <p>{statusMsg}</p>
        {merchantOrderId && <p>Order: <strong>{merchantOrderId}</strong></p>}
        <p>Attempt: {attempt} / {MAX_ATTEMPTS}</p>
      </div>
    </div>
  );
}