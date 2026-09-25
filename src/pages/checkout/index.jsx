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
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const TAX_RATE = 0.08;
const SHIPPING_THRESHOLD = 5000;

// ── Icons ─────────────────────────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TruckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 5v3h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PhonePeIcon = () => (
  <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
    <rect width="44" height="44" rx="10" fill="#5F259F" />
    <path
      d="M28.8 20.8c0-3.2-2.3-5.3-6.2-5.3H16v18.5h4.1v-5.9h1.8c3.9 0 6.9-2.1 6.9-7.3zm-4.1.1c0 1.8-1.2 2.8-3 2.8h-1.6V18h1.6c1.8 0 3 1 3 2.9z"
      fill="#FFFFFF"
    />
    <path
      d="M22.5 8L13 13.5l2 3.5 5.6-3.3 7 19.1h4.3L22.5 8z"
      fill="#FFFFFF"
      opacity="0.32"
    />
  </svg>
);

const UserIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const STEPS = [
  { id: 0, num: '01', title: 'Shipping Address', label: 'Delivery details' },
  { id: 1, num: '02', title: 'Payment Method',  label: 'PhonePe / Online' },
  { id: 2, num: '03', title: 'Review & Pay',    label: 'Order confirmation' },
];

// ── Step 1: Shipping Address Form ─────────────────────────────────────────────
function ShippingStep({ data, onChange, onNext, isAuthenticated, userProfile, incomingPincodeData }) {
  const [errs, setErrs] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateShipping(data);
    if (data.email && email(data.email)) {
      validation.email = email(data.email, 'Email');
    }
    if (hasErrors(validation)) {
      setErrs(validation);
      toast.warn('Please complete all required shipping fields correctly.');
      return;
    }
    setErrs({});
    onNext();
  };

  const f = (name) => ({
    value: data[name] || '',
    onChange: (e) => {
      onChange(name, e.target.value);
      setErrs((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
    },
    className: `co-input${errs[name] ? ' co-input--error' : ''}`,
  });

  return (
    <form className="co-card co-form" onSubmit={handleSubmit} noValidate>
      <div className="co-card__header">
        <div>
          <span className="co-card__tag">STEP 1 OF 3</span>
          <h2 className="co-card__title">Delivery Address</h2>
          <p className="co-card__subtitle">
            Enter your shipping location where you would like to receive your handcrafted bags.
          </p>
        </div>
      </div>

      {isAuthenticated && (
        <div className="co-autofill-banner">
          <div className="co-autofill-banner__icon">✨</div>
          <div className="co-autofill-banner__text">
            <strong>Logged in as {userProfile?.name || 'Valued Customer'}</strong>
            <span>Your saved contact & delivery details have been pre-filled.</span>
          </div>
        </div>
      )}

      {/* Row 1: First Name & Last Name */}
      <div className="co-form__grid co-form__grid--2">
        <div className="co-field">
          <label className="co-label" htmlFor="co-fname">
            First Name <span className="co-req">*</span>
          </label>
          <div className="co-input-wrap">
            <span className="co-input-icon"><UserIcon /></span>
            <input id="co-fname" type="text" placeholder="e.g. Rahul" {...f('firstName')} />
          </div>
          {errs.firstName && <span className="co-error-msg">{errs.firstName}</span>}
        </div>

        <div className="co-field">
          <label className="co-label" htmlFor="co-lname">
            Last Name <span className="co-req">*</span>
          </label>
          <div className="co-input-wrap">
            <span className="co-input-icon"><UserIcon /></span>
            <input id="co-lname" type="text" placeholder="e.g. Sharma" {...f('lastName')} />
          </div>
          {errs.lastName && <span className="co-error-msg">{errs.lastName}</span>}
        </div>
      </div>

      {/* Row 2: Address */}
      <div className="co-field">
        <label className="co-label" htmlFor="co-addr">
          Street Address / House No. / Landmark <span className="co-req">*</span>
        </label>
        <div className="co-input-wrap">
          <span className="co-input-icon"><MapPinIcon /></span>
          <input
            id="co-addr"
            type="text"
            placeholder="Flat / Building no., Street name, Landmark"
            {...f('address')}
          />
        </div>
        {errs.address && <span className="co-error-msg">{errs.address}</span>}
      </div>

      {/* Row 3: City, State, PIN */}
      <div className="co-form__grid co-form__grid--3">
        <div className="co-field">
          <label className="co-label" htmlFor="co-city">
            City <span className="co-req">*</span>
          </label>
          <input id="co-city" type="text" placeholder="City" {...f('city')} />
          {errs.city && <span className="co-error-msg">{errs.city}</span>}
        </div>

        <div className="co-field">
          <label className="co-label" htmlFor="co-state">
            State <span className="co-req">*</span>
          </label>
          <input id="co-state" type="text" placeholder="State" {...f('state')} />
          {errs.state && <span className="co-error-msg">{errs.state}</span>}
        </div>

        <div className="co-field">
          <label className="co-label" htmlFor="co-zip">
            PIN Code <span className="co-req">*</span>
          </label>
          <input
            id="co-zip"
            type="text"
            placeholder="6-digit PIN"
            maxLength={6}
            {...f('zip')}
          />
          {errs.zip && <span className="co-error-msg">{errs.zip}</span>}
        </div>
      </div>

      {/* Row 4: Email & Phone */}
      <div className="co-form__grid co-form__grid--2">
        <div className="co-field">
          <label className="co-label" htmlFor="co-email">
            Email Address <span className="co-req">*</span>
          </label>
          <div className="co-input-wrap">
            <span className="co-input-icon"><MailIcon /></span>
            <input
              id="co-email"
              type="email"
              placeholder="name@example.com"
              {...f('email')}
            />
          </div>
          {errs.email && <span className="co-error-msg">{errs.email}</span>}
          <span className="co-hint">Order confirmation & invoice will be sent here.</span>
        </div>

        <div className="co-field">
          <label className="co-label" htmlFor="co-phone">
            Phone Number <span className="co-req">*</span>
          </label>
          <div className="co-input-wrap co-input-wrap--phone">
            <span className="co-phone-prefix">+91</span>
            <input
              id="co-phone"
              type="tel"
              placeholder="10-digit mobile number"
              maxLength={10}
              {...f('phone')}
            />
          </div>
          {errs.phone && <span className="co-error-msg">{errs.phone}</span>}
          <span className="co-hint">Used for live courier dispatch SMS & OTP.</span>
        </div>
      </div>

      {/* Luxury Delivery Method Option */}
      <div className="co-delivery-option is-selected">
        <div className="co-delivery-option__icon">
          <TruckIcon />
        </div>
        <div className="co-delivery-option__info">
          <div className="co-delivery-option__top">
            <strong>Shree Mahaveer Express Delivery (3–5 Business Days)</strong>
            <span className="co-badge-free">FREE</span>
          </div>
          <p>
            Dispatched in signature eco-friendly dust bags with white-glove courier handling
            and full transit insurance.
          </p>
        </div>
        <div className="co-delivery-option__radio">
          <div className="co-radio-disc is-checked" />
        </div>
      </div>

      {/* Button Row */}
      <div className="co-form__actions">
        <Link to="/cart" className="co-btn-secondary">
          ← Back to Bag
        </Link>
        <button type="submit" className="co-btn-primary">
          <span>Continue to Payment</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </form>
  );
}

// ── Step 2: Payment Details (PhonePe ONLY) ────────────────────────────────────
function PaymentStep({ paymentMethod, onMethodChange, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="co-card co-form" onSubmit={handleSubmit} noValidate>
      <div className="co-card__header">
        <div>
          <span className="co-card__tag">STEP 2 OF 3</span>
          <h2 className="co-card__title">Payment Method</h2>
          <p className="co-card__subtitle">
            All payments are encrypted, 100% bank-grade secure, and processed via PhonePe.
          </p>
        </div>
        <div className="co-security-pill">
          <LockIcon />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Highlighted PhonePe / Online Payment Selection */}
      <div className="co-payment-selector">
        <label className={`co-payment-card${paymentMethod === 'ONLINE' ? ' is-active' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="ONLINE"
            checked={paymentMethod === 'ONLINE'}
            onChange={() => onMethodChange('ONLINE')}
            className="co-payment-card__radio-input"
          />

          <div className="co-payment-card__main">
            <div className="co-payment-card__header">
              <div className="co-payment-card__badge-logo">
                <PhonePeIcon />
              </div>

              <div className="co-payment-card__title-group">
                <div className="co-payment-card__title-row">
                  <h3 className="co-payment-card__title">PhonePe / Online Payment</h3>
                  <span className="co-payment-card__verified-badge">
                    <CheckIcon /> Official Payment Gateway
                  </span>
                </div>
                <p className="co-payment-card__desc">
                  UPI (PhonePe, Google Pay, Paytm), Credit &amp; Debit Cards, NetBanking
                </p>
              </div>

              <div className="co-radio-indicator">
                <div className="co-radio-indicator__dot" />
              </div>
            </div>

            {/* Supported Payment Logos / Chips */}
            <div className="co-payment-badges">
              <span className="co-pay-chip co-pay-chip--phonepe">PhonePe</span>
              <span className="co-pay-chip co-pay-chip--gpay">Google Pay</span>
              <span className="co-pay-chip co-pay-chip--paytm">Paytm</span>
              <span className="co-pay-chip co-pay-chip--upi">BHIM UPI</span>
              <span className="co-pay-chip">Visa</span>
              <span className="co-pay-chip">Mastercard</span>
              <span className="co-pay-chip">RuPay</span>
              <span className="co-pay-chip">NetBanking (50+ Banks)</span>
            </div>

            {/* Reassurance Callout Box */}
            <div className="co-payment-callout">
              <div className="co-payment-callout__item">
                <span className="co-callout-icon">🔒</span>
                <div>
                  <strong>Zero Transaction Fees</strong>
                  <span>No surcharge or hidden fees on PhonePe UPI or Cards.</span>
                </div>
              </div>
              <div className="co-payment-callout__item">
                <span className="co-callout-icon">⚡</span>
                <div>
                  <strong>Instant Confirmation</strong>
                  <span>Order is confirmed and locked immediately after payment.</span>
                </div>
              </div>
              <div className="co-payment-callout__item">
                <span className="co-callout-icon">🛡️</span>
                <div>
                  <strong>100% Buyer Protection</strong>
                  <span>Backed by PhonePe's RBI-regulated merchant security.</span>
                </div>
              </div>
            </div>
          </div>
        </label>
      </div>

      <div className="co-phonepe-notice">
        <div className="co-phonepe-notice__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5F259F" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <p>
          Upon clicking <strong>Review Order</strong>, you will review your order details.
          Next, you will be seamlessly redirected to the official <strong>PhonePe gateway</strong> to
          authenticate via UPI app, QR scan, or Card.
        </p>
      </div>

      {/* Button Row */}
      <div className="co-form__actions">
        <button type="button" className="co-btn-secondary" onClick={onBack}>
          ← Back to Address
        </button>
        <button type="submit" className="co-btn-primary">
          <span>Review Order</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </form>
  );
}

// ── Step 3: Review & Place Order ──────────────────────────────────────────────
function ReviewStep({
  shipping,
  paymentMethod,
  items,
  totals,
  onBack,
  onEditShipping,
  onPlace,
  placing = false,
}) {
  return (
    <div className="co-card co-form">
      <div className="co-card__header">
        <div>
          <span className="co-card__tag">STEP 3 OF 3</span>
          <h2 className="co-card__title">Review &amp; Confirm</h2>
          <p className="co-card__subtitle">
            Verify your delivery destination and items before proceeding to PhonePe.
          </p>
        </div>
      </div>

      {/* Summary Chips Grid */}
      <div className="co-review-cards">
        {/* Shipping address recap */}
        <div className="co-review-card">
          <div className="co-review-card__header">
            <div className="co-review-card__title-wrap">
              <span className="co-review-card__icon"><MapPinIcon /></span>
              <strong>Delivery Address</strong>
            </div>
            <button
              type="button"
              className="co-btn-text"
              onClick={onEditShipping}
              disabled={placing}
            >
              <EditIcon /> Edit
            </button>
          </div>
          <div className="co-review-card__content">
            <p className="co-review-card__name">
              {shipping.firstName} {shipping.lastName}
            </p>
            <p className="co-review-card__address">
              {shipping.address}, {shipping.city}, {shipping.state} – <strong>{shipping.zip}</strong>
            </p>
            <p className="co-review-card__contact">
              📞 +91 {shipping.phone} {shipping.email ? ` · ✉️ ${shipping.email}` : ''}
            </p>
          </div>
        </div>

        {/* Payment recap */}
        <div className="co-review-card co-review-card--payment">
          <div className="co-review-card__header">
            <div className="co-review-card__title-wrap">
              <PhonePeIcon />
              <div>
                <strong>PhonePe Online Gateway</strong>
                <span className="co-payment-sub">UPI / Cards / NetBanking</span>
              </div>
            </div>
            <span className="co-badge-verified">✓ Active</span>
          </div>
          <p className="co-review-card__pay-note">
            Redirects to encrypted PhonePe gateway. Zero extra charges.
          </p>
        </div>
      </div>

      {/* Items Preview */}
      <div className="co-review-items">
        <h3 className="co-review-items__title">
          Selected Items ({items.length})
        </h3>
        <div className="co-review-items__list">
          {items.map((item) => {
            const quantity = item.quantity || 1;
            return (
              <div key={item.id} className="co-review-item">
                <img src={item.image} alt={item.name} className="co-review-item__img" />
                <div className="co-review-item__meta">
                  <h4 className="co-review-item__name">{item.name}</h4>
                  <div className="co-review-item__chips">
                    <span className="co-chip">Qty: {quantity}</span>
                    {item.selectedColor && (
                      <span className="co-chip">Color: {item.selectedColor}</span>
                    )}
                    {item.selectedSize && (
                      <span className="co-chip">Size: {item.selectedSize}</span>
                    )}
                  </div>
                </div>
                <div className="co-review-item__price">
                  <strong>{fmt(item.price * quantity)}</strong>
                  {quantity > 1 && <small>{fmt(item.price)} each</small>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Reassurance Banner */}
      <div className="co-trust-strip">
        <div className="co-trust-item">
          <ShieldIcon />
          <span>Authentic Bags</span>
        </div>
        <div className="co-trust-item">
          <LockIcon />
          <span>RBI Licensed PhonePe</span>
        </div>
        <div className="co-trust-item">
          <TruckIcon />
          <span>Tracked Delivery</span>
        </div>
      </div>

      {/* Button Row */}
      <div className="co-form__actions">
        <button
          type="button"
          className="co-btn-secondary"
          onClick={onBack}
          disabled={placing}
        >
          ← Back to Payment
        </button>
        <button
          type="button"
          className="co-btn-phonepe"
          onClick={onPlace}
          disabled={placing}
        >
          {placing ? (
            <span className="co-btn-loading">
              <span className="co-spinner" />
              <span>Connecting to PhonePe…</span>
            </span>
          ) : (
            <span className="co-btn-content">
              <LockIcon />
              <span>Pay {fmt(totals.total)} via PhonePe</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Order Success Screen ──────────────────────────────────────────────────────
function OrderSuccess() {
  return (
    <div className="co-card co-success">
      <div className="co-success__icon-wrap">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#27834a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h2 className="co-success__title">Order Confirmed!</h2>
      <p className="co-success__body">
        Thank you for choosing Shree Mahaveer Collections. Your payment has been authorized
        and our atelier has received your order.
      </p>
      <div className="co-success__info-box">
        <div className="co-success__info-row">
          <span>Delivery Timeline:</span>
          <strong>3–5 Business Days</strong>
        </div>
        <div className="co-success__info-row">
          <span>Tracking Updates:</span>
          <strong>SMS &amp; Email updates on dispatch</strong>
        </div>
      </div>
      <div className="co-success__actions">
        <Link to="/products" className="co-btn-primary">
          Continue Shopping
        </Link>
        <Link to="/" className="co-btn-secondary">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

// ── Main Checkout Page ────────────────────────────────────────────────────────
function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState       = location.state || {};
  const selectedProduct     = locationState.selectedProduct || null;
  const incomingPincode     = locationState.pincode      || '';
  const incomingPincodeData = locationState.pincodeData  || null;
  const isAuthenticated     = isUserAuthenticated();
  const userProfile         = getUserProfile();

  const [step,          setStep]          = useState(0);
  const [success,       setSuccess]       = useState(false);
  const [orderPlacing,  setOrderPlacing]  = useState(false);
  const [errorMessage,  setErrorMessage]  = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // PhonePe ONLY
  const [checkoutMode,  setCheckoutMode]  = useState(() =>
    locationState.checkoutMode ?? (isAuthenticated ? 'user' : 'prompt')
  );

  // Coupon code state for enhanced luxury experience
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: '',
    lastName:  '',
    address:   '',
    city:      '',
    state:     '',
    zip:       incomingPincode || '',
    phone:     '',
    email:     '',
  });

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
    const shippingCost = subtotal > 0 && subtotal < SHIPPING_THRESHOLD ? 0 : 0; // Promotional Free shipping
    const discountAmount = appliedCoupon ? Math.round(subtotal * appliedCoupon.pct) : 0;
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = Math.round(taxableSubtotal * TAX_RATE);
    const total = taxableSubtotal + shippingCost + tax;

    return {
      subtotal,
      shipping: shippingCost,
      discount: discountAmount,
      tax,
      total,
    };
  }, [orderItems, appliedCoupon]);

  const updateShipping = (field, val) => setShipping((p) => ({ ...p, [field]: val }));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'SMC10' || code === 'WELCOME10' || code === 'FESTIVE') {
      setAppliedCoupon({ code, pct: 0.1 });
      setCouponMessage('✅ Coupon applied: 10% instant discount!');
      toast.success('🎉 10% discount applied to your order!');
    } else {
      setCouponMessage('❌ Invalid coupon code. Try WELCOME10');
      toast.error('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMessage('');
  };

  const validateOrder = () => {
    if (
      !shipping.firstName.trim() ||
      !shipping.lastName.trim() ||
      !shipping.address.trim() ||
      !shipping.city.trim() ||
      !shipping.state.trim() ||
      !shipping.zip.trim() ||
      !shipping.phone.trim()
    ) {
      setErrorMessage('Please complete all shipping details, including mobile number.');
      toast.warn('Please complete all required shipping details.');
      return false;
    }
    if (orderItems.length === 0) {
      setErrorMessage('Your bag is empty.');
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
      payment_method: 'ONLINE',
      payment_status: 'pending',
      order_status: 'pending',
      customer_name: `${shipping.firstName} ${shipping.lastName}`.trim(),
      email: shipping.email?.trim() || userProfile?.email || 'customer@smc.com',
      phone: shipping.phone.trim(),
      shipping_address: shipping.address.trim(),
      city: shipping.city.trim(),
      state: shipping.state.trim(),
      country: shipping.country || 'India',
      pincode: shipping.zip.trim(),
      items: normalizedItems,
      shipping_cost: Number(totals.shipping ?? 0) || 0,
      total_amount: Number(totals.total ?? 0) || 0,
      subtotal: Number(totals.subtotal ?? 0) || 0,
      tax: Number(totals.tax ?? 0) || 0,
    };

    try {
      const result = await createOrderOnline(payload);
      const redirectUrl = result.redirect_url || result.payment_url;

      if (result.status === true && redirectUrl) {
        toast.info('🔄 Redirecting to PhonePe payment gateway…', {
          position: 'top-right',
          autoClose: 2000,
        });
        clearCart();
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 800);
        return;
      }

      if (result.status === true || result.status === 'true') {
        toast.success(`✅ Order placed! Order ID: ${result.order_id || ''}`);
        clearCart();
        setSuccess(true);
      } else {
        throw new Error(result.message || 'Payment initiation failed. Please try again.');
      }
    } catch (error) {
      const msg = error.message || 'Order submission failed. Please try again.';
      setErrorMessage(msg);
      toast.error(`❌ ${msg}`);
    } finally {
      setOrderPlacing(false);
    }
  };

  const handleContinueAsGuest = () => {
    setCheckoutMode('guest');
  };

  const handleLogin = () => {
    navigate('/login', {
      state: { from: '/checkout', selectedProduct, checkoutMode: 'user' },
    });
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
      lastName:  prev.lastName  || userProfile.last_name  || userProfile.name?.split(' ').slice(1).join(' ') || '',
      address:   prev.address   || userProfile.address    || userProfile.shipping_address || '',
      city:      prev.city      || userProfile.city       || '',
      state:     prev.state     || userProfile.state      || '',
      zip:       incomingPincode || prev.zip || userProfile.zip || userProfile.pin_code || '',
      phone:     prev.phone     || userProfile.phone || userProfile.mobile || userProfile.phone_number || '',
      email:     prev.email     || userProfile.email || '',
    }));
  }, [isAuthenticated, userProfile, incomingPincode]);

  // Empty cart view
  if (orderItems.length === 0 && !success) {
    return (
      <div className="co-page">
        <div className="co-page__inner co-empty">
          <div className="co-empty__icon">🛍️</div>
          <h2 className="co-empty__title">Your Bag is Empty</h2>
          <p className="co-empty__subtitle">
            Explore our curated collections of backpacks, office bags, and travel companions.
          </p>
          <Link to="/products" className="co-btn-primary">
            Explore Collections →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      {/* Top Luxury Trust Strip */}
      <div className="co-top-trust">
        <div className="co-top-trust__inner">
          <div className="co-top-trust__item">
            <LockIcon />
            <span>256-Bit SSL Bank-Grade Encryption</span>
          </div>
          <div className="co-top-trust__item">
            <ShieldIcon />
            <span>PhonePe Official Verified Merchant</span>
          </div>
          <div className="co-top-trust__item">
            <TruckIcon />
            <span>Free Express Courier Across India</span>
          </div>
        </div>
      </div>

      <div className="co-page__inner">
        {success ? (
          <OrderSuccess />
        ) : (
          <>
            {/* Guest vs Login Prompt */}
            {!isAuthenticated && checkoutMode === 'prompt' ? (
              <div className="co-prompt-card">
                <div className="co-prompt-card__badge">FAST &amp; SECURE CHECKOUT</div>
                <h1 className="co-prompt-card__title">Choose How You Wish to Proceed</h1>
                <p className="co-prompt-card__subtitle">
                  Sign in to use your saved addresses and access express tracking, or checkout
                  seamlessly as a guest in seconds.
                </p>

                <div className="co-prompt-options">
                  <div className="co-prompt-col co-prompt-col--highlight">
                    <div className="co-prompt-col__tag">RECOMMENDED</div>
                    <div className="co-prompt-col__icon">✨</div>
                    <h3>Sign In / Create Account</h3>
                    <ul className="co-prompt-list">
                      <li>✓ Auto-fill saved addresses &amp; contact info</li>
                      <li>✓ Live SMS &amp; WhatsApp tracking updates</li>
                      <li>✓ Access warranty &amp; quick 7-day returns</li>
                    </ul>
                    <button type="button" className="co-btn-primary co-btn--full" onClick={handleLogin}>
                      Sign In &amp; Proceed
                    </button>
                  </div>

                  <div className="co-prompt-col">
                    <div className="co-prompt-col__icon">⚡</div>
                    <h3>Continue as Guest</h3>
                    <ul className="co-prompt-list">
                      <li>✓ No password or registration needed</li>
                      <li>✓ Instant entry of delivery destination</li>
                      <li>✓ Same fast delivery &amp; PhonePe security</li>
                    </ul>
                    <button
                      type="button"
                      className="co-btn-secondary co-btn--full"
                      onClick={handleContinueAsGuest}
                    >
                      Instant Guest Checkout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Collapsible Order Summary Bar */}
                <div className="co-mobile-summary">
                  <button
                    type="button"
                    className={`co-mobile-summary__toggle ${showMobileSummary ? 'is-expanded' : ''}`}
                    onClick={() => setShowMobileSummary((prev) => !prev)}
                    aria-expanded={showMobileSummary}
                  >
                    <div className="co-mobile-summary__left">
                      <span className="co-mobile-summary__icon">🛍️</span>
                      <span className="co-mobile-summary__label">
                        {showMobileSummary ? 'Hide order summary' : 'Show order summary'}
                      </span>
                      <span className={`co-mobile-summary__arrow ${showMobileSummary ? 'is-up' : ''}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                    <div className="co-mobile-summary__right">
                      <strong className="co-mobile-summary__total">{fmt(totals.total)}</strong>
                    </div>
                  </button>

                  {showMobileSummary && (
                    <div className="co-mobile-summary__drawer">
                      <div className="co-summary-items">
                        {orderItems.map((item) => (
                          <div key={item.id} className="co-summary-item">
                            <div className="co-summary-item__img-box">
                              <img src={item.image} alt={item.name} />
                              <span className="co-summary-item__qty-pill">{item.quantity || 1}</span>
                            </div>
                            <div className="co-summary-item__details">
                              <h4 className="co-summary-item__name">{item.name}</h4>
                              {(item.selectedColor || item.selectedSize) && (
                                <p className="co-summary-item__variants">
                                  {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                                  {item.selectedColor && item.selectedSize ? ' · ' : ''}
                                  {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                                </p>
                              )}
                            </div>
                            <div className="co-summary-item__price">
                              {fmt((item.price || 0) * (item.quantity || 1))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <form className="co-coupon-box" onSubmit={handleApplyCoupon}>
                        <div className="co-coupon-input-wrap">
                          <input
                            type="text"
                            placeholder="Promo code (e.g. WELCOME10)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            disabled={!!appliedCoupon}
                          />
                          {appliedCoupon ? (
                            <button
                              type="button"
                              className="co-btn-coupon-remove"
                              onClick={handleRemoveCoupon}
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="submit"
                              className="co-btn-coupon-apply"
                              disabled={!couponInput.trim()}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                        {couponMessage && (
                          <p className={`co-coupon-msg${appliedCoupon ? ' is-success' : ' is-error'}`}>
                            {couponMessage}
                          </p>
                        )}
                      </form>

                      <div className="co-totals-table">
                        <div className="co-totals-row">
                          <span>Bag Subtotal</span>
                          <span>{fmt(totals.subtotal)}</span>
                        </div>
                        {appliedCoupon && totals.discount > 0 && (
                          <div className="co-totals-row co-totals-row--discount">
                            <span>Promo Discount ({appliedCoupon.code})</span>
                            <span>-{fmt(totals.discount)}</span>
                          </div>
                        )}
                        <div className="co-totals-row">
                          <span>Express Courier Shipping</span>
                          <span className="co-free-text">
                            <span className="co-strike">₹299</span> FREE
                          </span>
                        </div>
                        <div className="co-totals-row">
                          <span>Estimated GST (8%)</span>
                          <span>{fmt(totals.tax)}</span>
                        </div>
                        <div className="co-totals-row co-totals-row--grand">
                          <div>
                            <strong>Total Payable</strong>
                            <small>Inclusive of all applicable taxes</small>
                          </div>
                          <strong className="co-grand-amount">{fmt(totals.total)}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Visual Luxury Stepper */}
                <div className="co-stepper" role="list">
                  {STEPS.map((s, idx) => {
                    const isDone = idx < step;
                    const isActive = idx === step;
                    return (
                      <div
                        key={s.id}
                        className={`co-stepper__step${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}`}
                        onClick={() => {
                          if (isDone) setStep(idx);
                        }}
                        style={{ cursor: isDone ? 'pointer' : 'default' }}
                      >
                        <div className="co-stepper__circle">
                          {isDone ? <CheckIcon /> : <span>{s.num}</span>}
                        </div>
                        <div className="co-stepper__text">
                          <strong className="co-stepper__title">{s.title}</strong>
                          <span className="co-stepper__label">{s.label}</span>
                        </div>
                        {idx < STEPS.length - 1 && <div className="co-stepper__connector" />}
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Current Step Tagline */}
                <div className="co-stepper-mobile-label">
                  <span className="co-stepper-mobile-label__tag">Step {step + 1} of 3</span>
                  <strong className="co-stepper-mobile-label__title">{STEPS[step].title}</strong>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="co-alert-error" role="alert">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Verified Pincode Notification */}
                {incomingPincodeData?.available && incomingPincode && (
                  <div className="co-alert-pincode">
                    <span className="co-alert-pincode__badge">VERIFIED</span>
                    <span>
                      Express courier available to PIN <strong>{incomingPincode}</strong>
                      {incomingPincodeData.city ? ` (${incomingPincodeData.city}, ${incomingPincodeData.state || ''})` : ''} · Standard Delivery is <strong>FREE</strong>
                    </span>
                  </div>
                )}

                {/* Main 2-Column Grid */}
                <div className="co-grid">
                  {/* Left Column: Multi-Step Flow */}
                  <div className="co-main-flow">
                    {step === 0 && (
                      <ShippingStep
                        data={shipping}
                        onChange={updateShipping}
                        onNext={() => setStep(1)}
                        isAuthenticated={isAuthenticated}
                        userProfile={userProfile}
                        incomingPincodeData={incomingPincodeData}
                      />
                    )}

                    {step === 1 && (
                      <PaymentStep
                        paymentMethod={paymentMethod}
                        onMethodChange={setPaymentMethod}
                        onNext={() => setStep(2)}
                        onBack={() => setStep(0)}
                      />
                    )}

                    {step === 2 && (
                      <ReviewStep
                        shipping={shipping}
                        paymentMethod={paymentMethod}
                        items={orderItems}
                        totals={totals}
                        onBack={() => setStep(1)}
                        onEditShipping={() => setStep(0)}
                        onPlace={handlePlace}
                        placing={orderPlacing}
                      />
                    )}
                  </div>

                  {/* Right Column: Sticky Luxury Order Summary */}
                  <aside className="co-sidebar">
                    <div className="co-summary-card">
                      <div className="co-summary-card__head">
                        <h3 className="co-summary-card__title">Order Summary</h3>
                        <span className="co-summary-card__count">
                          {orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {/* Items Preview List */}
                      <div className="co-summary-items">
                        {orderItems.map((item) => (
                          <div key={item.id} className="co-summary-item">
                            <div className="co-summary-item__img-box">
                              <img src={item.image} alt={item.name} />
                              <span className="co-summary-item__qty-pill">
                                {item.quantity || 1}
                              </span>
                            </div>
                            <div className="co-summary-item__details">
                              <h4 className="co-summary-item__name">{item.name}</h4>
                              {(item.selectedColor || item.selectedSize) && (
                                <p className="co-summary-item__variants">
                                  {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                                  {item.selectedColor && item.selectedSize ? ' · ' : ''}
                                  {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                                </p>
                              )}
                            </div>
                            <div className="co-summary-item__price">
                              {fmt((item.price || 0) * (item.quantity || 1))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Coupon Code Input */}
                      <form className="co-coupon-box" onSubmit={handleApplyCoupon}>
                        <div className="co-coupon-input-wrap">
                          <input
                            type="text"
                            placeholder="Promo code (e.g. WELCOME10)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            disabled={!!appliedCoupon}
                          />
                          {appliedCoupon ? (
                            <button
                              type="button"
                              className="co-btn-coupon-remove"
                              onClick={handleRemoveCoupon}
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="submit"
                              className="co-btn-coupon-apply"
                              disabled={!couponInput.trim()}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                        {couponMessage && (
                          <p className={`co-coupon-msg${appliedCoupon ? ' is-success' : ' is-error'}`}>
                            {couponMessage}
                          </p>
                        )}
                      </form>

                      {/* Totals Breakdown */}
                      <div className="co-totals-table">
                        <div className="co-totals-row">
                          <span>Bag Subtotal</span>
                          <span>{fmt(totals.subtotal)}</span>
                        </div>

                        {appliedCoupon && totals.discount > 0 && (
                          <div className="co-totals-row co-totals-row--discount">
                            <span>Promo Discount ({appliedCoupon.code})</span>
                            <span>-{fmt(totals.discount)}</span>
                          </div>
                        )}

                        <div className="co-totals-row">
                          <span>Express Courier Shipping</span>
                          <span className="co-free-text">
                            <span className="co-strike">₹299</span> FREE
                          </span>
                        </div>

                        <div className="co-totals-row">
                          <span>Estimated GST (8%)</span>
                          <span>{fmt(totals.tax)}</span>
                        </div>

                        <div className="co-totals-row co-totals-row--grand">
                          <div>
                            <strong>Total Payable</strong>
                            <small>Inclusive of all applicable taxes</small>
                          </div>
                          <strong className="co-grand-amount">{fmt(totals.total)}</strong>
                        </div>
                      </div>

                      {/* Gateway Badge */}
                      <div className="co-summary-gateway">
                        <div className="co-summary-gateway__logo">
                          <PhonePeIcon />
                        </div>
                        <div>
                          <strong>PhonePe Protected Checkout</strong>
                          <span>Fast &amp; encrypted transaction portal</span>
                        </div>
                      </div>
                    </div>

                    {/* Trust Pillar Badges */}
                    <div className="co-trust-pillars">
                      <div className="co-trust-pillar">
                        <div className="co-trust-pillar__icon">🛡️</div>
                        <div className="co-trust-pillar__info">
                          <strong>100% Authentic Quality</strong>
                          <span>Direct from Shree Mahaveer Collections atelier.</span>
                        </div>
                      </div>

                      <div className="co-trust-pillar">
                        <div className="co-trust-pillar__icon">🔄</div>
                        <div className="co-trust-pillar__info">
                          <strong>7-Day Replacement Guarantee</strong>
                          <span>Hassle-free exchange policy for complete peace of mind.</span>
                        </div>
                      </div>

                      <div className="co-trust-pillar">
                        <div className="co-trust-pillar__icon">⚡</div>
                        <div className="co-trust-pillar__info">
                          <strong>PhonePe Safe Shield</strong>
                          <span>Full refund protection on transaction failures.</span>
                        </div>
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
