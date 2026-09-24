import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerAction } from '../../../Actions/AuthAction';
import { validateRegisterForm, hasErrors } from '../../../utils/validators';
import { toast } from 'react-toastify';

import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import './style.scss';

// SVG Icons
const IconPerson = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
  </svg>
);

const IconCity = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconMap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const IconSpinner = () => (
  <svg className="auth-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" aria-hidden="true">
    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
  </svg>
);

const INITIAL_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  city: '',
  state: '',
  country: 'India',
  landmark_address: '',
  password: '',
  confirm_password: '',
  terms: true,
};

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));

    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setGeneralError('');
  };

  const handleRegister = useCallback(async (e) => {
    e.preventDefault();

    // 1. Validation
    const errs = validateRegisterForm(form);

    if (!form.terms) {
      errs.terms = 'Please accept the Terms & Conditions and Privacy Policy';
    }

    if (hasErrors(errs)) {
      setFieldErrors(errs);
      const firstErr = Object.values(errs)[0];
      if (firstErr) {
        setGeneralError(firstErr);
      }
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      // 2. Prepare payload compatible with backend register.php
      const { confirm_password, terms, ...rest } = form;
      const payload = {
        ...rest,
        country: rest.country || 'India',
        landmark_address: rest.landmark_address || rest.city || 'India',
      };

      await registerAction(payload);

      // 3. Success state
      setIsSuccess(true);
      toast.success('Account created successfully! Welcome to Shree Mahaveer Collections.', {
        position: 'top-right',
        autoClose: 3000,
      });

      // 4. Smooth auto-redirect to login
      setTimeout(() => {
        navigate('/login', { replace: true, state: location.state });
      }, 2500);
    } catch (err) {
      console.error('[Register] Error:', err);
      const rawMsg = err.message || '';
      let friendlyMsg = 'Registration failed. Please check your information and try again.';

      if (rawMsg.toLowerCase().includes('already') || rawMsg.toLowerCase().includes('duplicate') || rawMsg.toLowerCase().includes('exists')) {
        friendlyMsg = 'An account with this email or phone number is already registered. Please sign in instead.';
      } else if (rawMsg.toLowerCase().includes('network') || rawMsg.toLowerCase().includes('failed to fetch')) {
        friendlyMsg = 'Network connection issue. Please check your internet connection.';
      } else if (rawMsg) {
        friendlyMsg = rawMsg;
      }

      setGeneralError(friendlyMsg);
      toast.error(friendlyMsg, { position: 'top-right', autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  }, [form, navigate, location.state]);

  return (
    <AuthLayout activeTab="register">
      {isSuccess ? (
        // ── Success State Screen ──
        <div className="auth-success-card">
          <div className="auth-success-card__icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="40" height="40">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="auth-success-card__badge">WELCOME TO SMC ATELIER</span>
          <h2 className="auth-success-card__title">Welcome to the Family! 🎉</h2>
          <p className="auth-success-card__body">
            Your account has been created successfully. Redirecting you to sign in to access your dashboard...
          </p>
          <Link to="/login" state={location.state} className="auth-btn auth-btn--primary auth-btn--sheen">
            <span className="auth-btn__sheen-sweep" aria-hidden="true" />
            <span>Proceed to Login Now</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      ) : (
        // ── Registration Form ──
        <>
          <div className="auth-header">
            <div className="auth-header__badge-row">
              <span className="auth-header__badge">
                <span className="auth-header__badge-pulse" />
                Join SMC Privilege
              </span>
            </div>
            <h1 className="auth-header__title">Create Your Account</h1>
            <p className="auth-header__sub">
              Enjoy bespoke member pricing, express dispatch, and seamless consignment tracking.
            </p>
          </div>

          {generalError && (
            <div className="auth-alert auth-alert--error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleRegister} noValidate className="auth-form">
            {/* Row 1: First Name & Last Name */}
            <div className="auth-grid-2">
              <AuthInput
                id="reg-first-name"
                label="First Name"
                placeholder="Pradip"
                value={form.first_name}
                onChange={handleChange('first_name')}
                icon={<IconPerson />}
                error={fieldErrors.first_name}
                required
                autoComplete="given-name"
                disabled={loading}
              />
              <AuthInput
                id="reg-last-name"
                label="Last Name"
                placeholder="Mourya"
                value={form.last_name}
                onChange={handleChange('last_name')}
                icon={<IconPerson />}
                error={fieldErrors.last_name}
                required
                autoComplete="family-name"
                disabled={loading}
              />
            </div>

            {/* Row 2: Email & Phone Number */}
            <div className="auth-grid-2">
              <AuthInput
                id="reg-email"
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange('email')}
                icon={<IconMail />}
                error={fieldErrors.email}
                required
                autoComplete="email"
                disabled={loading}
              />
              <AuthInput
                id="reg-phone"
                label="Mobile Number"
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={form.phone_number}
                onChange={handleChange('phone_number')}
                icon={<IconPhone />}
                error={fieldErrors.phone_number}
                required
                autoComplete="tel"
                disabled={loading}
              />
            </div>

            {/* Row 3: City & State */}
            <div className="auth-grid-2">
              <AuthInput
                id="reg-city"
                label="City"
                placeholder="Mumbai"
                value={form.city}
                onChange={handleChange('city')}
                icon={<IconCity />}
                error={fieldErrors.city}
                required
                autoComplete="address-level2"
                disabled={loading}
              />
              <AuthInput
                id="reg-state"
                label="State"
                placeholder="Maharashtra"
                value={form.state}
                onChange={handleChange('state')}
                icon={<IconMap />}
                error={fieldErrors.state}
                required
                autoComplete="address-level1"
                disabled={loading}
              />
            </div>

            {/* Row 4: Password & Confirm Password */}
            <PasswordInput
              id="reg-password"
              label="Password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange('password')}
              error={fieldErrors.password}
              required
              autoComplete="new-password"
              disabled={loading}
            />

            {/* Live Password Strength Meter */}
            <PasswordStrengthBar password={form.password} />

            <PasswordInput
              id="reg-confirm-password"
              label="Confirm Password"
              placeholder="Re-enter password"
              value={form.confirm_password}
              onChange={handleChange('confirm_password')}
              error={fieldErrors.confirm_password}
              required
              autoComplete="new-password"
              disabled={loading}
            />

            {/* Terms and conditions agreement */}
            <label className="auth-checkbox-wrap">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={handleChange('terms')}
                disabled={loading}
              />
              <span>
                I agree to the <Link to="/shipping-returns">Terms &amp; Conditions</Link> and{' '}
                <Link to="/privacy-policy">Privacy Policy</Link>.
              </span>
            </label>
            {fieldErrors.terms && (
              <span className="auth-input-group__err-msg" style={{ marginTop: '-0.75rem', marginBottom: '1rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {fieldErrors.terms}
              </span>
            )}

            {/* Submit Button with Sweeping Sheen */}
            <button
              type="submit"
              className="auth-btn auth-btn--primary auth-btn--sheen"
              disabled={loading}
            >
              <span className="auth-btn__sheen-sweep" aria-hidden="true" />
              {loading ? (
                <>
                  <IconSpinner />
                  <span>Creating Your Account...</span>
                </>
              ) : (
                <>
                  <span>Create Your SMC Account</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <p className="auth-card-switch">
            Already have an SMC account?
            <Link to="/login" state={location.state} className="auth-card-switch__link">
              <span>Sign In</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}

export default RegisterPage;
