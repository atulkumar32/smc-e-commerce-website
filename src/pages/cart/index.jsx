import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './style.scss';

// ── Format currency ───────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

// ── Quantity stepper ──────────────────────────────────────────────────────────
function Stepper({ value, onInc, onDec }) {
  return (
    <div className="cart-stepper" role="group" aria-label="Quantity">
      <button className="cart-stepper__btn" onClick={onDec} aria-label="Decrease quantity">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <span className="cart-stepper__val" aria-live="polite">{value}</span>
      <button className="cart-stepper__btn" onClick={onInc} aria-label="Increase quantity">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

// ── Cart item row ─────────────────────────────────────────────────────────────
function CartItem({ item }) {
  const { removeItem, updateQuantity, moveToWishlist } = useCart();

  return (
    <div className="cart-item">
      <Link to={`/products/${item.id}`} className="cart-item__img-wrap">
        <img src={item.image} alt={item.name} className="cart-item__img" loading="lazy" />
      </Link>

      <div className="cart-item__body">
        <div className="cart-item__top">
          <div>
            <h3 className="cart-item__name">
              <Link to={`/products/${item.id}`}>{item.name}</Link>
            </h3>
            {(item.selectedColor || item.selectedSize) && (
              <p className="cart-item__meta">
                {item.selectedColor && (
                  <span className="cart-item__swatch" style={{ backgroundColor: item.selectedColor }} />
                )}
                {item.selectedSize && <span>{item.selectedSize}</span>}
              </p>
            )}
          </div>
          <span className="cart-item__price">{fmt(item.price * item.quantity)}</span>
        </div>

        <div className="cart-item__actions">
          <Stepper
            value={item.quantity}
            onInc={() => updateQuantity(item.id, item.quantity + 1)}
            onDec={() => updateQuantity(item.id, item.quantity - 1)}
          />

          <div className="cart-item__btns">
            <button
              className="cart-item__wish-btn"
              onClick={() => moveToWishlist(item)}
              aria-label="Move to wishlist"
            >
              <svg width="15" height="15" viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              Wishlist
            </button>

            <button
              className="cart-item__remove-btn"
              onClick={() => removeItem(item.id, item.name)}
              aria-label={`Remove ${item.name} from cart`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Checkout modal ────────────────────────────────────────────────────────────
function CheckoutModal({ total, onClose, onProceed }) {
  return (
    <div className="checkout-modal__backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Secure checkout">
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="checkout-modal__close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="checkout-modal__icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h3 className="checkout-modal__title">Secure Checkout Initiated</h3>
        <p className="checkout-modal__body">
          Redirecting to our secure payment gateway to finalise your order of{' '}
          <strong>{fmt(total)}</strong>.
        </p>
        <div className="checkout-modal__actions">
          <button className="checkout-modal__btn checkout-modal__btn--primary" onClick={onProceed}>
            Proceed
          </button>
          <button className="checkout-modal__btn checkout-modal__btn--outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cart page ─────────────────────────────────────────────────────────────────
function CartPage() {
  const { cartItems, totals, clearCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleProceed = () => {
    setShowModal(false);
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <div className="cart-page__inner">
        {/* <h1 className="cart-page__title">Shopping Cart</h1> */}

        {cartItems.length === 0 ? (
          <div className="cart-page__empty">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
            </svg>
            <p>Your cart is empty.</p>
            <Link to="/products" className="cart-page__empty-btn">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-page__grid">
            {/* Items column */}
            <div className="cart-page__items">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
              <button className="cart-page__clear" onClick={clearCart}>
                Clear Cart
              </button>
            </div>

            {/* Summary column */}
            <aside className="cart-page__summary" aria-label="Order summary">
              <h2 className="cart-page__summary-title">Order Summary</h2>

              <div className="cart-page__summary-rows">
                <div className="cart-page__summary-row">
                  <span>Subtotal</span>
                  <span>{fmt(totals.subtotal)}</span>
                </div>
                <div className="cart-page__summary-row">
                  <span>Shipping</span>
                  <span>{totals.shipping === 0 ? 'Free' : fmt(totals.shipping)}</span>
                </div>
                <div className="cart-page__summary-row">
                  <span>Tax (8%)</span>
                  <span>{fmt(totals.tax)}</span>
                </div>
                <div className="cart-page__summary-row cart-page__summary-row--total">
                  <span>Total</span>
                  <span>{fmt(totals.total)}</span>
                </div>
              </div>

              <button
                className="cart-page__checkout-btn"
                onClick={() => setShowModal(true)}
              >
                Proceed to Checkout
              </button>

              <Link to="/products" className="cart-page__continue">
                ← Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>

      {showModal && (
        <CheckoutModal
          total={totals.total}
          onClose={() => setShowModal(false)}
          onProceed={handleProceed}
        />
      )}
    </div>
  );
}

export default CartPage;
