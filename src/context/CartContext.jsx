import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';

// ─────────────────────────────────────────────────────────────────────────────
//  CartContext  — single source of truth for Cart + Wishlist
//  All toast notifications live here so every caller gets them for free.
// ─────────────────────────────────────────────────────────────────────────────

const CartContext = createContext(null);

const TAX_RATE          = 0.08;   // 8 %
const SHIPPING_THRESHOLD = 5000;  // free shipping above ₹5 000

// ── Shared toast config ───────────────────────────────────────────────────────
const TOAST_OPTS = { position: 'top-right', autoClose: 2800 };
const TOAST_ERR  = { position: 'top-right', autoClose: 4000 };

const CART_KEY     = 'smc_cart';
const WISHLIST_KEY = 'smc_wishlist';

function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

export function CartProvider({ children }) {
  const [cartItems,     setCartItems]     = useState(() => readStorage(CART_KEY));
  const [wishlistItems, setWishlistItems] = useState(() => readStorage(WISHLIST_KEY));

  // Persist cart to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cartItems)); }
    catch { /* quota exceeded — silent */ }
  }, [cartItems]);

  // Persist wishlist to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistItems)); }
    catch { /* quota exceeded — silent */ }
  }, [wishlistItems]);

  // ── Cart ──────────────────────────────────────────────────────────────────

  const addItem = useCallback((product, quantity = 1) => {
    if (!product) return;
    const name = product.name || 'Product';
    // Guard: out of stock
    if (product.stock !== undefined && Number(product.stock) === 0) {
      toast.error(`${name} is currently out of stock`, {
        ...TOAST_ERR,
        toastId: `oos-${product.id}`,
      });
      return;
    }

    // Check outside setCartItems to avoid double-fire in React 18 StrictMode
    const alreadyInCart = cartItems.some((i) => i.id === product.id);
    if (alreadyInCart) {
      toast.info(`Already in your cart — ${name}`, {
        ...TOAST_OPTS,
        toastId: `already-${product.id}`,  // dedupe: same id = no duplicate
      });
      return;
    }

    toast.success(`Added to cart — ${name}`, {
      ...TOAST_OPTS,
      toastId: `added-${product.id}`,
    });
    setCartItems((prev) => [...prev, { ...product, quantity }]);
  }, [cartItems]);

  const isInCart = useCallback(
    (productId) => cartItems.some((i) => i.id === productId),
    [cartItems]
  );

  const removeItem = useCallback((productId, productName = 'Product') => {
    setCartItems((prev) => prev.filter((i) => i.id !== productId));
    toast.info(`Removed from cart — ${productName}`, {
      ...TOAST_OPTS,
      toastId: `cart-rm-${productId}`,
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.success('Cart cleared successfully', {
      ...TOAST_OPTS,
      toastId: 'cart-cleared',
    });
  }, []);

  // ── Wishlist ──────────────────────────────────────────────────────────────

  const addToWishlist = useCallback(
    (product) => {
      if (!product || !product.id) return;
      const alreadyWishlisted = wishlistItems.some((i) => i.id === product.id);
      const name = product.name || 'Product';
      const toastId = `wishlist-${product.id}`;

      if (alreadyWishlisted) {
        toast.info(`Already in your wishlist — ${name}`, {
          ...TOAST_OPTS,
          toastId,
        });
        return;
      }
      setWishlistItems((prev) => [...prev, { ...product }]);
      toast.success(`Saved to wishlist — ${name}`, {
        ...TOAST_OPTS,
        toastId,
      });
    },
    [wishlistItems]
  );

  const removeFromWishlist = useCallback((productId, productName = 'Product') => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== productId));
    toast.info(`Removed from wishlist — ${productName}`, {
      ...TOAST_OPTS,
      toastId: `wishlist-${productId}`,
    });
  }, []);

  const isWishlisted = useCallback(
    (productId) => wishlistItems.some((i) => i.id === productId),
    [wishlistItems]
  );

  const toggleWishlist = useCallback(
    (product) => {
      if (!product || !product.id) return;
      const alreadyWishlisted = wishlistItems.some((i) => i.id === product.id);
      const name = product.name || 'Product';
      const toastId = `wishlist-${product.id}`;

      if (alreadyWishlisted) {
        setWishlistItems((prev) => prev.filter((i) => i.id !== product.id));
        toast.info(`Removed from wishlist — ${name}`, {
          ...TOAST_OPTS,
          toastId,
        });
      } else {
        setWishlistItems((prev) => [...prev, { ...product }]);
        toast.success(`Saved to wishlist — ${name}`, {
          ...TOAST_OPTS,
          toastId,
        });
      }
    },
    [wishlistItems]
  );

  // Move wishlist → cart (removes from wishlist, adds to cart)
  const moveToCart = useCallback(
    (product) => {
      if (!product || !product.id) return;
      const name = product.name || 'Product';
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
      setWishlistItems((prev) => prev.filter((i) => i.id !== product.id));
      toast.success(`Moved to cart — ${name}`, {
        ...TOAST_OPTS,
        toastId: `move-cart-${product.id}`,
      });
    },
    []
  );

  // Move cart → wishlist (removes from cart, saves to wishlist)
  const moveToWishlist = useCallback(
    (product) => {
      if (!product || !product.id) return;
      const name = product.name || 'Product';
      setWishlistItems((prev) => {
        if (prev.find((i) => i.id === product.id)) return prev;
        return [...prev, { ...product }];
      });
      setCartItems((prev) => prev.filter((i) => i.id !== product.id));
      toast.success(`Saved to wishlist — ${name}`, {
        ...TOAST_OPTS,
        toastId: `move-wishlist-${product.id}`,
      });
    },
    []
  );

  // ── Derived totals ────────────────────────────────────────────────────────

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal > 0 && subtotal < SHIPPING_THRESHOLD ? 299 : 0;
    const tax      = Math.round(subtotal * TAX_RATE);
    const total    = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [cartItems]);

  const totalItems = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

  const wishlistCount = wishlistItems.length;

  // ── Provider ──────────────────────────────────────────────────────────────

  return (
    <CartContext.Provider
      value={{
        // Cart
        cartItems,
        addItem,
        isInCart,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totals,
        // Wishlist
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
        toggleWishlist,
        wishlistCount,
        // Cross-list
        moveToCart,
        moveToWishlist,
        // Legacy alias
        items: cartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
