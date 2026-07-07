import { WEB_URLS } from '../../Config/UrlsConfig';

export async function checkPaymentStatus(merchantOrderId,UserId) {
const params = new URLSearchParams({
  merchantOrderId,
  UserId: UserId,
});

const url = `${WEB_URLS.PAYMENT_STATUS}?${params.toString()}`;
  // console.log('📡 Polling:', url);

  try {
    const res = await fetch(url, { 
      method: 'GET', 
      credentials: 'include' 
    });

    if (!res.ok) {
      console.warn(`HTTP Error: ${res.status}`);
      return { 
        status: 'FAILED', 
        order_id: merchantOrderId, 
        message: 'Failed to fetch payment status from server',
        raw: {} 
      };
    }

    const raw = await res.json();
    console.log('✅ API Response:', raw);

    // Strong success detection
    const isSuccess = raw.status === true || 
                     raw.state === 'COMPLETED' || 
                     raw.data?.state === 'COMPLETED' || 
                     raw.data?.raw?.state === 'COMPLETED';

    return {
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      order_id: merchantOrderId,
      message: raw.message || (isSuccess ? 'Payment Successful' : 'Payment Failed'),
      raw
    };

  } catch (err) {
    console.error('Fetch failed:', err);
    return { 
      status: 'FAILED', 
      order_id: merchantOrderId, 
      message: 'Network error while checking payment',
      raw: {} 
    };
  }
}

export default checkPaymentStatus;