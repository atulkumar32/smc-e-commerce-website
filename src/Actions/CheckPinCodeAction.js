/**
 * CheckPinCodeAction.js
 *
 * Check if delivery is available for a given pincode.
 *
 * GET  checkPincode.php?pincode=243504
 *
 * Response (serviceable):
 * {
 *   "status": true,
 *   "message": "Delivery available",
 *   "data": {
 *     "pincode": "243504",
 *     "city": "New Delhi",
 *     "state": "Delhi",
 *     "status": "serviceable",
 *     "delivery_charge": 50,
 *     "estimated_delivery_time": "2-3 Days",
 *     "notes": "Fast delivery available testing"
 *   }
 * }
 *
 * Response (not serviceable / not found):
 * { "status": false, "message": "Delivery not available for this pincode" }
 */

import { BASE_URL } from '../Config/ApiConfig';

const CHECK_PINCODE_URL = `${BASE_URL}smc/api/v1/data/checkPincode.php`;

/**
 * @param {string} pincode  — 6-digit pincode string
 * @returns {Promise<{
 *   available:  boolean,
 *   message:    string,
 *   data:       object|null,   — filled when available === true
 *   city:       string,
 *   state:      string,
 *   deliveryCharge:     number,
 *   estimatedDelivery:  string,
 *   notes:      string,
 * }>}
 */
export const checkPincodeAction = async (pincode) => {
  if (!pincode || String(pincode).trim().length !== 6) {
    return {
      available: false,
      message:   'Please enter a valid 6-digit pincode',
      data:      null,
    };
  }

  const url = `${CHECK_PINCODE_URL}?pincode=${encodeURIComponent(pincode.trim())}`;

  console.group('📍 [CheckPincode] GET');
  console.log('URL     :', url);
  console.log('pincode :', pincode);
  console.groupEnd();

  try {
    const res  = await fetch(url, { method: 'GET' });
    const text = await res.text();

    console.group('📨 [CheckPincode] Response — HTTP', res.status);
    console.log(text.slice(0, 500));
    console.groupEnd();

    let json = {};
    try { json = text ? JSON.parse(text) : {}; } catch (e) {
      console.warn('[CheckPincode] JSON parse failed:', e.message);
    }

    const d = json.data || {};
    const available = json.status === true
      && (d.status === 'serviceable' || json.message?.toLowerCase().includes('available'));

    console.log(available
      ? `✅ [CheckPincode] Serviceable — ${d.city}, ${d.state} | Charge: ₹${d.delivery_charge} | ETA: ${d.estimated_delivery_time}`
      : `❌ [CheckPincode] Not serviceable — ${json.message}`
    );

    return {
      available,
      message:          json.message || (available ? 'Delivery available' : 'Delivery not available'),
      data:             available ? d : null,
      city:             d.city              || '',
      state:            d.state             || '',
      deliveryCharge:   Number(d.delivery_charge ?? 0),
      estimatedDelivery:d.estimated_delivery_time || '',
      notes:            d.notes             || '',
    };
  } catch (err) {
    console.error('❌ [CheckPincode] Network error:', err.message);
    return {
      available: false,
      message:   'Unable to check pincode. Please try again.',
      data:      null,
    };
  }
};
