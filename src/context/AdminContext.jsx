import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initialOrders } from '../data/mockData';
import { fetchProductsAction } from '../Actions/ProductUploadAction';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [orders] = useState(initialOrders);

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await fetchProductsAction();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
        ? data.products
        : [];
      setProducts(list);
    } catch (err) {
      console.error('[AdminContext] Failed to load products:', err.message);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  // ── Upsert (add or update) a product in local state ─────────────────────────
  const upsertProduct = (product) => {
    // Use string product_id as the canonical match key (same as resolveProductId)
    const incomingId = product.product_id ?? product.productId ?? product.id;
    setProducts((prev) => {
      const exists = prev.some(
        (p) => (p.product_id ?? p.productId ?? p.id) === incomingId
      );
      if (exists) {
        return prev.map((p) =>
          (p.product_id ?? p.productId ?? p.id) === incomingId
            ? { ...p, ...product }
            : p
        );
      }
      return [product, ...prev];
    });
  };

  const deleteProduct = (id) => {
    setProducts((prev) =>
      prev.filter((p) => (p.product_id ?? p.productId ?? p.id) !== id)
    );
  };

  const stats = useMemo(
    () => ({
      totalProducts: products.length,
      totalOrders: orders.length,
      revenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      publishedProducts: products.filter((p) => p.status === 'published').length,
    }),
    [products, orders]
  );

  return (
    <AdminContext.Provider
      value={{
        products,
        productsLoading,
        orders,
        stats,
        upsertProduct,
        deleteProduct,
        refreshProducts: loadProducts,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
