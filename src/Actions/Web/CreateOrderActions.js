/**
 * Create an online order
 * @param {object} payload - Complete order data
 * @returns {Promise<object>}
 */
export async function createOrderOnline(payload) {
  const url = 'http://localhost/smc/api/v1/data/CreateOrderOnline.php';

  console.log('🚀 Sending order to:', url);
  console.log('📦 Payload:', payload);

  try {
    const response = await fetch(url, {
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