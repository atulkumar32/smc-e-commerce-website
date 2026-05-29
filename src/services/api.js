const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function getUserToken() {
  return localStorage.getItem('user_token') || '';
}

async function request(endpoint, options = {}) {
  const token = getUserToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export const api = {
  request,
  getProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) =>
    request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  getOrders: (options) => request('/orders', options),
  createOrder: (data, options) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    }),
  getUserProfile: (options) => request('/user/profile', options),
  updateUserProfile: (data, options) =>
    request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    }),
  getUserOrders: (options) => request('/orders', options),
};

export default api;
