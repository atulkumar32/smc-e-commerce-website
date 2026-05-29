import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './style.scss';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

const STEPS = ['01 Shipping', '02 Payment', '03 Review'];

// ── Step 1: Shipping ──────────────────────────────────────────────────────────
function ShippingStep({ data, onChange, onNext }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="co-form" onSubmit={handleSubmit} noValidate>
      <h2 className="co-form__title">Shipping Address</h2>

      <div className="co-form__row co-form__row--2">
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-fname">First Name *</label>
          <input id="co-fname" className="co-form__input" type="text" placeholder="First Name"
            value={data.firstName} onChange={(e) => onChange('firstName', e.target.value)} required />
        </div>
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-lname">Last Name *</label>
          <input id="co-lname" className="co-form__input" type="text" placeholder="Last Name"
            value={data.lastName} onChange={(e) => onChange('lastName', e.target.value)} required />
        </div>
      </div>

      <div className="co-form__field">
        <label className="co-form__label" htmlFor="co-addr">Address *</label>
        <input id="co-addr" className="co-form__input" type="text" placeholder="Street address"
          value={data.address} onChange={(e) => onChange('address', e.target.value)} required />
      </div>

      <div className="co-form__row co-form__row--3">
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-city">City *</label>
          <input id="co-city" className="co-form__input" type="text" placeholder="City"
            value={data.city} onChange={(e) => onChange('city', e.target.value)} required />
        </div>
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-state">State *</label>
          <input id="co-state" className="co-form__input" type="text" placeholder="State"
            value={data.state} onChange={(e) => onChange('state', e.target.value)} required />
        </div>
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-zip">PIN Code *</label>
          <input id="co-zip" className="co-form__input" type="text" placeholder="PIN"
            value={data.zip} onChange={(e) => onChange('zip', e.target.value)} required />
        </div>
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
        Continue to Payment
      </button>
    </form>
  );
}

// ── Step 2: Payment ───────────────────────────────────────────────────────────
function PaymentStep({ data, onChange, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="co-form" onSubmit={handleSubmit} noValidate>
      <h2 className="co-form__title">Payment Details</h2>

      <div className="co-form__field">
        <label className="co-form__label" htmlFor="co-card">Card Number *</label>
        <input id="co-card" className="co-form__input" type="text"
          placeholder="1234 5678 9012 3456" maxLength={19}
          value={data.cardNumber} onChange={(e) => onChange('cardNumber', e.target.value)} required />
      </div>

      <div className="co-form__row co-form__row--2">
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-expiry">Expiry *</label>
          <input id="co-expiry" className="co-form__input" type="text" placeholder="MM / YY"
            maxLength={7}
            value={data.expiry} onChange={(e) => onChange('expiry', e.target.value)} required />
        </div>
        <div className="co-form__field">
          <label className="co-form__label" htmlFor="co-cvv">CVV *</label>
          <input id="co-cvv" className="co-form__input" type="password" placeholder="•••"
            maxLength={4}
            value={data.cvv} onChange={(e) => onChange('cvv', e.target.value)} required />
        </div>
      </div>

      <div className="co-form__field">
        <label className="co-form__label" htmlFor="co-name-card">Name on Card *</label>
        <input id="co-name-card" className="co-form__input" type="text" placeholder="Full name"
          value={data.nameOnCard} onChange={(e) => onChange('nameOnCard', e.target.value)} required />
      </div>

      <div className="co-form__secure-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        256-bit SSL encrypted. Your payment info is never stored.
      </div>

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
function ReviewStep({ shipping, cartItems, totals, onBack, onPlace }) {
  return (
    <div className="co-form">
      <h2 className="co-form__title">Review Your Order</h2>

      <div className="co-review__section">
        <h3 className="co-review__section-title">Shipping To</h3>
        <p className="co-review__text">
          {shipping.firstName} {shipping.lastName}<br />
          {shipping.address}, {shipping.city}, {shipping.state} – {shipping.zip}
        </p>
      </div>

      <div className="co-review__section">
        <h3 className="co-review__section-title">Items ({cartItems.length})</h3>
        {cartItems.map((item) => (
          <div key={item.id} className="co-review__item">
            <img src={item.image} alt={item.name} className="co-review__item-img" />
            <div className="co-review__item-info">
              <p className="co-review__item-name">{item.name}</p>
              <p className="co-review__item-qty">Qty: {item.quantity}</p>
            </div>
            <p className="co-review__item-price">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price * item.quantity)}
            </p>
          </div>
        ))}
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
        <button type="button" className="co-form__back-btn" onClick={onBack}>← Back</button>
        <button type="button" className="co-form__next-btn co-form__next-btn--flex co-form__next-btn--gold" onClick={onPlace}>
          Place Order
        </button>
      </div>
    </div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────
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
  const { cartItems, totals, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', address: '', city: '', state: '', zip: '',
  });
  const [payment, setPayment] = useState({
    cardNumber: '', expiry: '', cvv: '', nameOnCard: '',
  });

  const updateShipping = (field, val) => setShipping((p) => ({ ...p, [field]: val }));
  const updatePayment  = (field, val) => setPayment((p) => ({ ...p, [field]: val }));

  const handlePlace = () => {
    clearCart();
    setSuccess(true);
  };

  if (cartItems.length === 0 && !success) {
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
            {/* Step indicator */}
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
                  <PaymentStep data={payment} onChange={updatePayment}
                    onNext={() => setStep(2)} onBack={() => setStep(0)} />
                )}
                {step === 2 && (
                  <ReviewStep shipping={shipping} cartItems={cartItems}
                    totals={totals} onBack={() => setStep(1)} onPlace={handlePlace} />
                )}
              </div>

              {/* Right: mini summary */}
              <aside className="co-page__summary">
                <h2 className="co-page__summary-title">Order Summary</h2>
                <div className="co-page__summary-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="co-page__summary-item">
                      <img src={item.image} alt={item.name} className="co-page__summary-img" />
                      <div className="co-page__summary-info">
                        <p className="co-page__summary-name">{item.name}</p>
                        <p className="co-page__summary-qty">× {item.quantity}</p>
                      </div>
                      <p className="co-page__summary-price">
                        {fmt(item.price * item.quantity)}
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
      </div>
    </div>
  );
}

export default CheckoutPage;
