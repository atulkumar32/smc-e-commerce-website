import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCartDrawer } from '../../context/CartDrawerContext';
import './style.scss';

const SHIPPING_THRESHOLD = 5000;

export default function CartDrawer() {
  const { open, closeDrawer } = useCartDrawer();
  const {
    cartItems,
    removeItem,
    updateQuantity,
    clearCart,
    totals,
    totalItems,
  } = useCart();
  const navigate = useNavigate();

  // Lock body scroll + kill x-axis scrollbar when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflowX = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflowX = '';
    };
  }, [open]);

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeDrawer();
    navigate('/cart');
  };

  const shippingLeft = SHIPPING_THRESHOLD - totals.subtotal;
  const shippingPct  = Math.min((totals.subtotal / SHIPPING_THRESHOLD) * 100, 100);

  return (
    <>
      {/* Overlay — covers everything including header */}
      <div
        className={`cdr-overlay${open ? ' cdr-overlay--show' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`cdr${open ? ' cdr--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* ── Header ── */}
        <div className="cdr__head">
          <div className="cdr__head-left">
            <div className="cdr__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 8h12l-1 13H7L6 8z"/>
                <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
              </svg>
            </div>
            <span>My Cart</span>
            {totalItems > 0 && <em className="cdr__count">{totalItems}</em>}
          </div>
          <div className="cdr__head-right">
            {cartItems.length > 0 && (
              <button className="cdr__clear" onClick={clearCart} type="button">
                Clear all
              </button>
            )}
            <button className="cdr__close" onClick={closeDrawer} aria-label="Close cart" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Free shipping progress ── */}
        {cartItems.length > 0 && (
          <div className="cdr__shipping-bar">
            {shippingLeft > 0 ? (
              <p>
                Add <strong>₹{shippingLeft.toLocaleString()}</strong> more for{' '}
                <span className="cdr__free">FREE delivery</span>
              </p>
            ) : (
              <p className="cdr__free-msg">
                🎉 You've unlocked <strong>FREE delivery!</strong>
              </p>
            )}
            <div className="cdr__shipping-track">
              <div className="cdr__shipping-fill" style={{ width: `${shippingPct}%` }} />
            </div>
          </div>
        )}

        {/* ── Body / item list ── */}
        <div className="cdr__body">
          {cartItems.length === 0 ? (
            <div className="cdr__empty">
              <div className="cdr__empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M6 8h12l-1 13H7L6 8z"/>
                  <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
                  <line x1="9" y1="12" x2="9" y2="17"/>
                  <line x1="12" y1="11" x2="12" y2="17"/>
                  <line x1="15" y1="12" x2="15" y2="17"/>
                </svg>
              </div>
              <h4>Your cart is empty</h4>
              <p>Looks like you haven't added anything yet.</p>
              <button className="cdr__shop-btn" onClick={() => { closeDrawer(); navigate('/products'); }}>
                Browse Products
              </button>
            </div>
          ) : (
            <ul className="cdr__list">
              {cartItems.map((item) => (
                <li key={item.id} className="cdr__item">
                  {/* Image */}
                  <div className="cdr__item-img">
                    {item.image
                      ? <img src={item.image} alt={item.name} loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      : <div className="cdr__item-img-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <path d="M6 8h12l-1 13H7L6 8z"/>
                            <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
                          </svg>
                        </div>
                    }
                  </div>

                  {/* Details */}
                  <div className="cdr__item-info">
                    <p className="cdr__item-name">{item.name}</p>
                    {item.colorName && (
                      <p className="cdr__item-variant">Colour: {item.colorName}</p>
                    )}
                    {item.category && (
                      <p className="cdr__item-cat">{item.category}</p>
                    )}

                    <div className="cdr__item-row">
                      {/* Qty stepper */}
                      <div className="cdr__qty">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >−</button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>

                      {/* Price */}
                      <div className="cdr__item-price">
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="cdr__item-mrp">₹{item.originalPrice}</span>
                        )}
                        <span className="cdr__item-sp">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    className="cdr__item-remove"
                    onClick={() => removeItem(item.id, item.name)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer (only when items exist) ── */}
        {cartItems.length > 0 && (
          <div className="cdr__foot">
            {/* Order summary */}
            <div className="cdr__summary">
              <div className="cdr__summary-row">
                <span>Subtotal</span>
                <span>₹{totals.subtotal.toLocaleString()}</span>
              </div>
              {totals.shipping > 0 && (
                <div className="cdr__summary-row">
                  <span>Delivery</span>
                  <span>₹{totals.shipping}</span>
                </div>
              )}
              {totals.shipping === 0 && totals.subtotal > 0 && (
                <div className="cdr__summary-row cdr__summary-row--free">
                  <span>Delivery</span>
                  <span>FREE</span>
                </div>
              )}
              <div className="cdr__summary-row">
                <span>Tax (8%)</span>
                <span>₹{totals.tax.toLocaleString()}</span>
              </div>
              <div className="cdr__summary-row cdr__summary-row--total">
                <span>Total</span>
                <span>₹{totals.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <button className="cdr__checkout-btn" onClick={handleCheckout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Proceed to Checkout
            </button>
            <button className="cdr__view-btn" onClick={handleViewCart}>
              View Full Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
