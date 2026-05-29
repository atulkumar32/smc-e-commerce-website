import api from './api';

const LOCAL_PRODUCTS_KEY = 'schoolbags_products';

function getLocalProducts() {
  try {
    const stored = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveLocalProducts(products) {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

function createLocalProduct(payload) {
  const products = getLocalProducts() || [];
  const newProduct = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString().split('T')[0],
  };
  products.unshift(newProduct);
  saveLocalProducts(products);
  return newProduct;
}

function updateLocalProduct(id, payload) {
  const products = getLocalProducts() || [];
  const index = products.findIndex((p) => p.id === id);
  const updated = { ...(index >= 0 ? products[index] : {}), ...payload, id };
  if (index >= 0) {
    products[index] = updated;
    saveLocalProducts(products);
  }
  return updated;
}

async function tryApiCall(apiFn, localFallback) {
  try {
    return await apiFn();
  } catch {
    return localFallback();
  }
}

export async function createProduct(payload) {
  return tryApiCall(
    () =>
      api.request('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    () => createLocalProduct(payload)
  );
}

export async function updateProduct(id, payload) {
  return tryApiCall(
    () =>
      api.request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    () => updateLocalProduct(id, payload)
  );
}

export async function deleteProductApi(id) {
  return tryApiCall(
    () => api.request(`/products/${id}`, { method: 'DELETE' }),
    () => {
      const products = (getLocalProducts() || []).filter((p) => p.id !== id);
      saveLocalProducts(products);
      return { success: true };
    }
  );
}

export async function fetchProducts() {
  return tryApiCall(
    () => api.getProducts(),
    () => getLocalProducts() || []
  );
}
