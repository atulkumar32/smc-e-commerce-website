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
    // Guard: out of stock
    if (product.stock !== undefined && Number(product.stock) === 0) {
      toast.error(`❌ ${product.name} is out of stock`, TOAST_ERR);
      return;
    }

    // Check outside setCartItems to avoid double-fire in React 18 StrictMode
    const alreadyInCart = cartItems.some((i) => i.id === product.id);
    if (alreadyInCart) {
      toast.info(`🛒 ${product.name} is already in your cart`, {
        ...TOAST_OPTS,
        toastId: `already-${product.id}`,  // dedupe: same id = no duplicate
      });
      return;
    }

    toast.success(`🛒 Added to cart — ${product.name}`, {
      ...TOAST_OPTS,
      toastId: `added-${product.id}`,
    });
    setCartItems((prev) => [...prev, { ...product, quantity }]);
  }, [cartItems]);

  const isInCart = useCallback(
    (productId) => cartItems.some((i) => i.id === productId),
    [cartItems]
  );

  const removeItem = useCallback((productId, productName = 'Item') => {
    setCartItems((prev) => prev.filter((i) => i.id !== productId));
    toast.info(`🗑️ ${productName} removed from cart`, TOAST_OPTS);
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.success('🛒 Cart cleared successfully', TOAST_OPTS);
  }, []);

  // ── Wishlist ──────────────────────────────────────────────────────────────

  const addToWishlist = useCallback((product) => {
    setWishlistItems((prev) => {
      if (prev.find((i) => i.id === product.id)) {
        toast.info(`💛 ${product.name} is already in your wishlist`, TOAST_OPTS);
        return prev;
      }
      toast.success(`💛 Saved to wishlist — ${product.name}`, TOAST_OPTS);
      return [...prev, { ...product }];
    });
  }, []);

  const removeFromWishlist = useCallback((productId, productName = 'Item') => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== productId));
    toast.info(`💔 ${productName} removed from wishlist`, TOAST_OPTS);
  }, []);

  const isWishlisted = useCallback(
    (productId) => wishlistItems.some((i) => i.id === productId),
    [wishlistItems]
  );

  const toggleWishlist = useCallback(
    (product) => {
      setWishlistItems((prev) => {
        const exists = prev.find((i) => i.id === product.id);
        if (exists) {
          toast.info(`💔 ${product.name} removed from wishlist`, TOAST_OPTS);
          return prev.filter((i) => i.id !== product.id);
        }
        toast.success(`💛 Saved to wishlist — ${product.name}`, TOAST_OPTS);
        return [...prev, { ...product }];
      });
    },
    []
  );

  // Move wishlist → cart (removes from wishlist, adds to cart)
  const moveToCart = useCallback(
    (product) => {
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
      toast.success(`🛒 ${product.name} moved to cart`, TOAST_OPTS);
    },
    []
  );

  // Move cart → wishlist (removes from cart, saves to wishlist)
  const moveToWishlist = useCallback(
    (product) => {
      setWishlistItems((prev) => {
        if (prev.find((i) => i.id === product.id)) return prev;
        return [...prev, { ...product }];
      });
      setCartItems((prev) => prev.filter((i) => i.id !== product.id));
      toast.success(`💛 ${product.name} moved to wishlist`, TOAST_OPTS);
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
