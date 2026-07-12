import { WEB_URLS } from "../../Config/UrlsConfig";

/**
 * Create an online order
 * @param {object} payload - Complete order data
 * @returns {Promise<object>}
 */
export async function createOrderOnline(payload) {

console.log("WEB_URLS.PAYMENT_API : ",WEB_URLS.PAYMENT_API);
  try {
    const response = await fetch(WEB_URLS.PAYMENT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      result = { message: 'Invalid JSON response from server' };
    }

    console.log('📥 Server Response:', { status: response.status, body: result });

    if (!response.ok) {
      throw new Error(result?.message || `Server error: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('❌ createOrderOnline failed:', error);
    throw error;
  }
}