import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { isUserAuthenticated, getUserProfile } from '../../services/apiClients';
import { createOrderOnline } from '../../Actions/Web/CreateOrderActions';
import { validateShipping, hasErrors, email } from '../../utils/validators';
import './style.scss';


const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

const TAX_RATE = 0.08;
const SHIPPING_THRESHOLD = 5000;

const STEPS = ['01 Shipping', '02 Payment', '03 Review'];

// ── Step 1: Shipping ──────────────────────────────────────────────────────────
function ShippingStep({ data, onChange, onNext }) {
  const [errs, setErrs] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateShipping(data);
    if (hasErrors(validation)) { setErrs(validation); return; }
    setErrs({});
    onNext();
  };

  const f = (name) => ({
    value: data[name],
    onChange: (e) => { onChange(name, e.target.value); setErrs((p) => { const n = { ...p }; delete n[name]; return n; }); },
    className: `co-form__input${errs[name] ? ' co-form__input--error' : ''}`,
  });

  return (
    <form className="co-form" onSubmit={handleSubmit} noValidate>
      <h2 className="co-form__title">Shipping Address</h2>

      <div className="co-form__row co-form__row--2">
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-fname">First Name *</label>
          <input id="co-fname" type="text" placeholder="First Name" {...f('firstName')} />
          {errs.firstName && <span className="co-form__error-msg">{errs.firstName}</span>}
        </div>
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-lname">Last Name *</label>
          <input id="co-lname" type="text" placeholder="Last Name" {...f('lastName')} />
          {errs.lastName && <span className="co-form__error-msg">{errs.lastName}</span>}
        </div>
      </div>

      <div className="co-form__field">
        <label className="co-form__label" htmlFor="co-addr">Address *</label>
        <input id="co-addr" type="text" placeholder="Street address" {...f('address')} />
        {errs.address && <span className="co-form__error-msg">{errs.address}</span>}
      </div>


      <div className="co-form__row co-form__row--3">
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-city">City *</label>
          <input id="co-city" type="text" placeholder="City" {...f('city')} />
          {errs.city && <span className="co-form__error-msg">{errs.city}</span>}
        </div>
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-state">State *</label>
          <input id="co-state" type="text" placeholder="State" {...f('state')} />
          {errs.state && <span className="co-form__error-msg">{errs.state}</span>}
        </div>
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-zip">PIN Code *</label>
          <input id="co-zip" type="text" placeholder="6-digit PIN" maxLength={6} {...f('zip')} />
          {errs.zip && <span className="co-form__error-msg">{errs.zip}</span>}
        </div>
      </div>
      <div className="co-form__field">
        <label className="co-form__label" htmlFor="co-addr">Customer Email *</label>
        <input id="co-email" type="email" name='email' placeholder="enter your email" {...f('email')} />
        {errs.address && <span className="co-form__error-msg">{errs.email}</span>}
      </div>
      <div className="co-form__field">
        <label className="co-form__label" htmlFor="co-phone">Phone *</label>
        <input id="co-phone" type="tel" placeholder="10-digit mobile number" maxLength={10} {...f('phone')} />
        {errs.phone && <span className="co-form__error-msg">{errs.phone}</span>}
      </div>

      <div className="co-form__delivery-card">
        <div className="co-form__delivery-icon" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 5v3h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <div>
          <h3 className="co-form__delivery-title">Premium Delivery</h3>
          <p className="co-form__delivery-desc">
            Your order will be handled with white-glove care and delivered in our signature
            eco-friendly heritage packaging within 3–5 business days.
          </p>
        </div>
      </div>

      <button type="submit" className="co-form__next-btn">
        Continue to Payment →
      </button>
    </form>
  );
}

// ── Step 2: Payment ───────────────────────────────────────────────────────────
function PaymentStep({ paymentMethod, onMethodChange, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="co-form" onSubmit={handleSubmit} noValidate>
      <h2 className="co-form__title">Payment Details</h2>

      <div className="co-form__field">
        <label className="co-form__label">Payment Method *</label>
        <div className="co-form__radio-group">
          <label className="co-form__radio">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={() => onMethodChange('COD')}
            />
            Cash on Delivery
          </label>
          <label className="co-form__radio">
            <input
              type="radio"
              name="paymentMethod"
              value="ONLINE"
              checked={paymentMethod === 'ONLINE'}
              onChange={() => onMethodChange('ONLINE')}
            />
            PhonePe / Online Payment
          </label>
        </div>
      </div>

      {paymentMethod === 'ONLINE' && (
        <div className="co-form__note">
          After you place the order, you will be redirected to PhonePe to complete the payment.
        </div>
      )}
      {paymentMethod === 'COD' && (
        <div className="co-form__note">
          <strong>Cash on Delivery (COD)</strong> is available for this order. Only the shipping charges are collected online to confirm your order. The balance amount for the products can be paid at the time of delivery.
        </div>
      )}

      <div className="co-form__btn-row">
        <button type="button" className="co-form__back-btn" onClick={onBack}>← Back</button>
        <button type="submit" className="co-form__next-btn co-form__next-btn--flex">
          Review Order
        </button>
      </div>
    </form>
  );
}

// ── Step 3: Review ────────────────────────────────────────────────────────────
function ReviewStep({ shipping, paymentMethod, items, totals, onBack, onPlace, placing = false }) {
  return (
    <div className="co-form">
      <h2 className="co-form__title">Review Your Order</h2>

      <div className="co-review__section">
        <h3 className="co-review__section-title">Shipping To</h3>
        <p className="co-review__text">
          {shipping.firstName} {shipping.lastName}<br />
          {shipping.address}, {shipping.city}, {shipping.state} – {shipping.zip}<br />
          {shipping.phone}
        </p>
      </div>

      <div className="co-review__section">
        <h3 className="co-review__section-title">Payment Method</h3>
        <p className="co-review__text">
          {paymentMethod === 'ONLINE' ? 'PhonePe / Online Payment' : 'Cash on Delivery'}
        </p>
      </div>

      <div className="co-review__section">
        <h3 className="co-review__section-title">Items ({items.length})</h3>
        {items.map((item) => {
          const quantity = item.quantity || 1;
          return (
            <div key={item.id} className="co-review__item">
              <img src={item.image} alt={item.name} className="co-review__item-img" />
              <div className="co-review__item-info">
                <p className="co-review__item-name">{item.name}</p>
                <p className="co-review__item-qty">Qty: {quantity}</p>
                {(item.selectedColor || item.selectedSize) && (
                  <p className="co-review__item-meta">
                    {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                    {item.selectedColor && item.selectedSize ? ' · ' : ''}
                    {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                  </p>
                )}
              </div>
              <p className="co-review__item-price">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price * quantity)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="co-review__totals">
        {[
          ['Subtotal', fmt(totals.subtotal)],
          ['Shipping', totals.shipping === 0 ? 'Free' : fmt(totals.shipping)],
          ['Tax (8%)', fmt(totals.tax)],
        ].map(([label, val]) => (
          <div key={label} className="co-review__total-row">
            <span>{label}</span><span>{val}</span>
          </div>
        ))}
        <div className="co-review__total-row co-review__total-row--grand">
          <span>Total</span><span>{fmt(totals.total)}</span>
        </div>
      </div>

      <div className="co-form__btn-row">
        <button type="button" className="co-form__back-btn" onClick={onBack} disabled={placing}>
          ← Back
        </button>
        <button
          type="button"
          className="co-form__next-btn co-form__next-btn--flex co-form__next-btn--gold"
          onClick={onPlace}
          disabled={placing}
          style={{ opacity: placing ? 0.7 : 1, cursor: placing ? 'not-allowed' : 'pointer' }}
        >
          {placing
            ? (paymentMethod === 'ONLINE' ? '⏳ Redirecting to PhonePe…' : '⏳ Placing Order…')
            : (paymentMethod === 'ONLINE' ? '💳 Pay with PhonePe' : '✅ Place Order')}
        </button>
      </div>
    </div>
  );
}

// ── Success screen order placed  ────────────────────────────────────────────────────────────
function OrderSuccess() {
  return (
    <div className="co-success">
      <div className="co-success__icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h2 className="co-success__title">Order Placed!</h2>
      <p className="co-success__body">
        Thank you for your purchase. You will receive a confirmation email shortly.
        Your order will be delivered within 3–5 business days.
      </p>
      <Link to="/" className="co-success__btn">Back to Home</Link>
    </div>
  );
}

// ── Main checkout page ────────────────────────────────────────────────────────
function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', address: '', city: '', state: '', zip: '', phone: '',
  });

  const locationState = location.state || {};
  const selectedProduct = locationState.selectedProduct || null;
  const isAuthenticated = isUserAuthenticated();
  const userProfile = getUserProfile();
  const [checkoutMode, setCheckoutMode] = useState(() =>
    locationState.checkoutMode ?? (isAuthenticated ? 'user' : 'prompt')
  );

  const orderItems = useMemo(() => {
    if (selectedProduct) {
      return [{
        ...selectedProduct,
        quantity: selectedProduct.quantity ?? 1,
        image: selectedProduct.image || selectedProduct.primaryImage || selectedProduct.gallery?.[0] || '',
      }];
    }
    if (cartItems.length > 0) return cartItems;
    return [];
  }, [cartItems, selectedProduct]);

  const totals = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const shippingCost = subtotal > 0 && subtotal < SHIPPING_THRESHOLD ? 299 : 0;
    const tax = Math.round(subtotal * TAX_RATE);
    return { subtotal, shipping: shippingCost, tax, total: subtotal + shippingCost + tax };
  }, [orderItems]);

  const updateShipping = (field, val) => setShipping((p) => ({ ...p, [field]: val }));

  const validateOrder = () => {
    if (!shipping.firstName.trim() || !shipping.lastName.trim() || !shipping.address.trim() || !shipping.city.trim() || !shipping.state.trim() || !shipping.zip.trim() || !shipping.phone.trim()) {
      setErrorMessage('Please fill in all shipping details, including phone number.');
      return false;
    }
    if (orderItems.length === 0) {
      setErrorMessage('Your order is empty.');
      return false;
    }
    return true;
  };

  const handlePlace = async () => {
    if (!validateOrder()) return;
    setErrorMessage('');
    setOrderPlacing(true);

    const normalizedItems = orderItems.map((item) => {
      const quantity = Number(item.quantity ?? 1) || 1;
      const price = Number(item.price ?? 0) || 0;
      return {
        product_id: item.product_id || item.id,
        name: item.name,
        quantity,
        price,
        total_price: quantity * price,
        selectedColor: item.selectedColor ?? null,
        selectedSize: item.selectedSize ?? null,
        image: item.image,
      };
    });

    const payload = {
      payment_method: paymentMethod,
      payment_status: 'pending',
      order_status: 'pending',
      customer_name: `${shipping.firstName} ${shipping.lastName}`,
      email: shipping.email?.trim() || userProfile?.email || 'n/a',
      phone: shipping.phone,
      shipping_address: shipping.address,
      city: shipping.city,
      state: shipping.state,
      country: shipping.country || 'India',
      pincode: shipping.zip,
      // Required by backend contract
      items: normalizedItems,
      shipping_cost: Number(totals.shipping ?? 0) || 0,
      total_amount: Number(totals.total ?? 0) || 0,
      // Extra breakdown
      subtotal: Number(totals.subtotal ?? 0) || 0,
      tax: Number(totals.tax ?? 0) || 0,
    };

    // remove debug logs in production

    try {
      const result = await createOrderOnline(payload);

      // ── ONLINE payment: redirect_url comes back when status is true ──
      if (paymentMethod === 'ONLINE' || paymentMethod === "COD") {
        const redirectUrl = result.redirect_url || result.payment_url;
        if (result.status === true && redirectUrl) {
          toast.info('🔄 Redirecting to PhonePe payment gateway…', {
            position: 'top-right', autoClose: 2000,
          });
          clearCart();
          // Small delay so toast is visible before leaving the page
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 800);
          return;
        }
        // status false or no url — surface the server message
        throw new Error(result.message || 'Payment initiation failed. Please try again.');
      }
      // ── COD: order saved, go to success ──
      if (result.status === true || result.status === 'true') {
        toast.success(`✅ Order placed! Order ID: ${result.order_id || ''}`, {
          position: 'top-right', autoClose: 4000,
        });
        clearCart();
        setSuccess(true);
      } else {
        throw new Error(result.message || 'Order submission failed.');
      }
    } catch (error) {
      const msg = error.message || 'Order submission failed. Please try again.';
      setErrorMessage(msg);
      toast.error(`❌ ${msg}`, { position: 'top-right', autoClose: 5000 });
    } finally {
      setOrderPlacing(false);
    }
  };

  const handleContinueAsGuest = () => {
    setCheckoutMode('guest');
  };

  const handleLogin = () => {
    navigate('/login', { state: { from: '/checkout', selectedProduct, checkoutMode: 'user' } });
  };

  useEffect(() => {
    if (isAuthenticated) {
      setCheckoutMode('user');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !userProfile) return;
    setShipping((prev) => ({
      firstName: prev.firstName || userProfile.first_name || userProfile.name?.split(' ')[0] || '',
      lastName: prev.lastName || userProfile.last_name || userProfile.name?.split(' ').slice(1).join(' ') || '',
      address: prev.address || userProfile.address || userProfile.shipping_address || '',
      city: prev.city || userProfile.city || '',
      state: prev.state || userProfile.state || '',
      zip: prev.zip || userProfile.zip || userProfile.pin_code || '',
      phone: prev.phone || userProfile.phone || userProfile.mobile || userProfile.phone_number || '',
    }));
  }, [isAuthenticated, userProfile]);

  if (orderItems.length === 0 && !success) {
    return (
      <div className="co-page">
        <div className="co-page__inner co-page__inner--empty">
          <p>Your cart is empty.</p>
          <Link to="/products" className="co-form__next-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <div className="co-page__inner">
        {success ? (
          <OrderSuccess />
        ) : (
          <>
            {!isAuthenticated && checkoutMode === 'prompt' ? (
              <div className="co-page__grid">
                <div className="co-page__form-col">
                  <div className="co-guest-prompt">
                    <h2>Continue Checkout</h2>
                    <p>
                      Sign in for faster checkout and auto-filled shipping details, or continue
                      as a guest to complete your order without an account.
                    </p>
                    <div className="co-guest-prompt__actions">
                      <button type="button" className="co-form__next-btn" onClick={handleLogin}>
                        Sign in to checkout
                      </button>
                      <button type="button" className="co-form__back-btn" onClick={handleContinueAsGuest}>
                        Continue as guest
                      </button>
                    </div>
                    <div className="co-guest-prompt__note">
                      You can still place your order without registering. If you already have an account,
                      signing in saves your address and speeds up the purchase.
                    </div>
                  </div>
                </div>
                <aside className="co-page__summary">
                  <h2 className="co-page__summary-title">Order Summary</h2>
                  <div className="co-page__summary-items">
                    {orderItems.map((item) => (
                      <div key={item.id} className="co-page__summary-item">
                        <img src={item.image} alt={item.name} className="co-page__summary-img" />
                        <div className="co-page__summary-info">
                          <p className="co-page__summary-name">{item.name}</p>
                          <p className="co-page__summary-qty">× {item.quantity}</p>
                        </div>
                        <p className="co-page__summary-price">
                          {fmt((item.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="co-page__summary-totals">
                    <div className="co-page__summary-row">
                      <span>Subtotal</span><span>{fmt(totals.subtotal)}</span>
                    </div>
                    <div className="co-page__summary-row">
                      <span>Shipping</span>
                      <span>{totals.shipping === 0 ? 'Free' : fmt(totals.shipping)}</span>
                    </div>
                    <div className="co-page__summary-row">
                      <span>Tax</span><span>{fmt(totals.tax)}</span>
                    </div>
                    <div className="co-page__summary-row co-page__summary-row--total">
                      <span>Total</span><span>{fmt(totals.total)}</span>
                    </div>
                  </div>
                </aside>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                {errorMessage && (
                  <div className="co-form__error" role="alert">
                    {errorMessage}
                  </div>
                )}
                <div className="co-steps" role="list" aria-label="Checkout steps">
                  {STEPS.map((label, i) => (
                    <div
                      key={label}
                      role="listitem"
                      className={`co-steps__item${i === step ? ' is-active' : i < step ? ' is-done' : ''}`}
                      aria-current={i === step ? 'step' : undefined}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="co-page__grid">
                  {/* Left: form */}
                  <div className="co-page__form-col">
                    {step === 0 && (
                      <ShippingStep data={shipping} onChange={updateShipping} onNext={() => setStep(1)} />
                    )}
                    {step === 1 && (
                      <PaymentStep paymentMethod={paymentMethod} onMethodChange={setPaymentMethod}
                        onNext={() => setStep(2)} onBack={() => setStep(0)} />
                    )}
                    {step === 2 && (
                      <ReviewStep shipping={shipping} paymentMethod={paymentMethod} items={orderItems}
                        totals={totals} onBack={() => setStep(1)} onPlace={handlePlace}
                        placing={orderPlacing} />
                    )}
                  </div>

                  {/* Right: mini summary */}
                  <aside className="co-page__summary">
                    <h2 className="co-page__summary-title">Order Summary</h2>
                    <div className="co-page__summary-items">
                      {orderItems.map((item) => (
                        <div key={item.id} className="co-page__summary-item">
                          <img src={item.image} alt={item.name} className="co-page__summary-img" />
                          <div className="co-page__summary-info">
                            <p className="co-page__summary-name">{item.name}</p>
                            <p className="co-page__summary-qty">× {item.quantity}</p>
                          </div>
                          <p className="co-page__summary-price">
                            {fmt((item.price || 0) * (item.quantity || 1))}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="co-page__summary-totals">
                      <div className="co-page__summary-row">
                        <span>Subtotal</span><span>{fmt(totals.subtotal)}</span>
                      </div>
                      <div className="co-page__summary-row">
                        <span>Shipping</span>
                        <span>{totals.shipping === 0 ? 'Free' : fmt(totals.shipping)}</span>
                      </div>
                      <div className="co-page__summary-row">
                        <span>Tax</span><span>{fmt(totals.tax)}</span>
                      </div>
                      <div className="co-page__summary-row co-page__summary-row--total">
                        <span>Total</span><span>{fmt(totals.total)}</span>
                      </div>
                    </div>
                  </aside>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
