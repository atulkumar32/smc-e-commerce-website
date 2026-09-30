import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerAction } from '../../../Actions/AuthAction';
import { validateRegisterForm, hasErrors } from '../../../utils/validators';
import { toast } from 'react-toastify';

import AuthLayout from '../components/AuthLayout';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import '../auth.scss';

// SVG Icons
const IconPerson = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.81 19.79 19.79 0 0 1 1.01 1.18 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92z" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconCity = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// Google G Icon
const IconGoogle = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.13z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
    />
  </svg>
);

const IconSpinner = () => (
  <svg className="smc-auth__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" aria-hidden="true">
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const errs = validateRegisterForm(form);
    if (!form.terms) {
      errs.terms = 'Please accept the Terms & Conditions and Privacy Policy';
    }

    if (hasErrors(errs)) {
      setFieldErrors(errs);
      const firstKey = Object.keys(errs)[0];
      const el = document.getElementById(`reg-${firstKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone_number: form.phone_number.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country,
        landmark_address: form.landmark_address.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
      };

      await registerAction(payload);
      setIsSuccess(true);
      toast.success('Registration successful! Please sign in with your credentials.');
    } catch (err) {
      const msg = err.message || 'Registration failed. Please check your information and try again.';
      setGeneralError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [form]);

  if (isSuccess) {
    return (
      <AuthLayout activeTab="register">
        <div className="smc-auth__success-card">
          <div className="smc-auth__success-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="32" height="32">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="smc-auth__title">Account Created!</h2>
          <p className="smc-auth__subtitle">
            Welcome to Shree Mahaveer Collections, {form.first_name}! Your account is now active and ready for school orders.
          </p>
          <button
            type="button"
            className="smc-auth__submit-btn"
            onClick={() => navigate('/login', { state: location.state })}
          >
            <span>Proceed to Sign In</span>
            <span className="smc-auth__btn-arrow">→</span>
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout activeTab="register">
      <div className="smc-auth__register-box">
        <div className="smc-auth__heading-group">
          <h2 className="smc-auth__title">Create Account</h2>
          <p className="smc-auth__subtitle">
            Sign up to unlock exclusive student pricing, order tracking and faster checkout
          </p>
        </div>

        {generalError && (
          <div className="smc-auth__alert" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{generalError}</span>
          </div>
        )}

        <form className="smc-auth__form" onSubmit={handleRegister} noValidate>
          {/* First & Last Name */}
          <div className="smc-auth__grid-2">
            <div className={`smc-auth__field${fieldErrors.first_name ? ' has-error' : ''}`}>
              <label className="smc-auth__label" htmlFor="reg-first_name">
                First Name <span className="smc-auth__req">*</span>
              </label>
              <div className="smc-auth__input-wrap">
                <span className="smc-auth__input-icon"><IconPerson /></span>
                <input
                  id="reg-first_name"
                  type="text"
                  className="smc-auth__input"
                  placeholder="Rahul"
                  value={form.first_name}
                  onChange={handleChange('first_name')}
                  disabled={loading}
                />
              </div>
              {fieldErrors.first_name && <span className="smc-auth__error-text">{fieldErrors.first_name}</span>}
            </div>

            <div className={`smc-auth__field${fieldErrors.last_name ? ' has-error' : ''}`}>
              <label className="smc-auth__label" htmlFor="reg-last_name">
                Last Name <span className="smc-auth__req">*</span>
              </label>
              <div className="smc-auth__input-wrap">
                <span className="smc-auth__input-icon"><IconPerson /></span>
                <input
                  id="reg-last_name"
                  type="text"
                  className="smc-auth__input"
                  placeholder="Sharma"
                  value={form.last_name}
                  onChange={handleChange('last_name')}
                  disabled={loading}
                />
              </div>
              {fieldErrors.last_name && <span className="smc-auth__error-text">{fieldErrors.last_name}</span>}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="smc-auth__grid-2">
            <div className={`smc-auth__field${fieldErrors.email ? ' has-error' : ''}`}>
              <label className="smc-auth__label" htmlFor="reg-email">
                Email Address <span className="smc-auth__req">*</span>
              </label>
              <div className="smc-auth__input-wrap">
                <span className="smc-auth__input-icon"><IconMail /></span>
                <input
                  id="reg-email"
                  type="email"
                  className="smc-auth__input"
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && <span className="smc-auth__error-text">{fieldErrors.email}</span>}
            </div>

            <div className={`smc-auth__field${fieldErrors.phone_number ? ' has-error' : ''}`}>
              <label className="smc-auth__label" htmlFor="reg-phone_number">
                Phone Number <span className="smc-auth__req">*</span>
              </label>
              <div className="smc-auth__input-wrap">
                <span className="smc-auth__input-icon"><IconPhone /></span>
                <input
                  id="reg-phone_number"
                  type="tel"
                  className="smc-auth__input"
                  placeholder="9876543210"
                  value={form.phone_number}
                  onChange={handleChange('phone_number')}
                  disabled={loading}
                />
              </div>
              {fieldErrors.phone_number && <span className="smc-auth__error-text">{fieldErrors.phone_number}</span>}
            </div>
          </div>

          {/* City & State */}
          <div className="smc-auth__grid-2">
            <div className={`smc-auth__field${fieldErrors.city ? ' has-error' : ''}`}>
              <label className="smc-auth__label" htmlFor="reg-city">
                City <span className="smc-auth__req">*</span>
              </label>
              <div className="smc-auth__input-wrap">
                <span className="smc-auth__input-icon"><IconCity /></span>
                <input
                  id="reg-city"
                  type="text"
                  className="smc-auth__input"
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={handleChange('city')}
                  disabled={loading}
                />
              </div>
              {fieldErrors.city && <span className="smc-auth__error-text">{fieldErrors.city}</span>}
            </div>

            <div className={`smc-auth__field${fieldErrors.state ? ' has-error' : ''}`}>
              <label className="smc-auth__label" htmlFor="reg-state">
                State <span className="smc-auth__req">*</span>
              </label>
              <div className="smc-auth__input-wrap">
                <span className="smc-auth__input-icon"><IconCity /></span>
                <input
                  id="reg-state"
                  type="text"
                  className="smc-auth__input"
                  placeholder="Maharashtra"
                  value={form.state}
                  onChange={handleChange('state')}
                  disabled={loading}
                />
              </div>
              {fieldErrors.state && <span className="smc-auth__error-text">{fieldErrors.state}</span>}
            </div>
          </div>

          {/* Landmark / Delivery Address */}
          <div className={`smc-auth__field${fieldErrors.landmark_address ? ' has-error' : ''}`}>
            <label className="smc-auth__label" htmlFor="reg-landmark">
              Delivery Address / Landmark <span className="smc-auth__req">*</span>
            </label>
            <div className="smc-auth__input-wrap">
              <input
                id="reg-landmark"
                type="text"
                className="smc-auth__input"
                placeholder="Flat / House No., Street, Landmark"
                value={form.landmark_address}
                onChange={handleChange('landmark_address')}
                disabled={loading}
              />
            </div>
            {fieldErrors.landmark_address && <span className="smc-auth__error-text">{fieldErrors.landmark_address}</span>}
          </div>

          {/* Password & Confirm Password */}
          <div className="smc-auth__grid-2">
            <div className={`smc-auth__field${fieldErrors.password ? ' has-error' : ''}`}>
              <label className="smc-auth__label" htmlFor="reg-password">
                Password <span className="smc-auth__req">*</span>
              </label>
              <div className="smc-auth__input-wrap">
                <span className="smc-auth__input-icon"><IconLock /></span>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="smc-auth__input"
                  placeholder="Create password"
                  value={form.password}
                  onChange={handleChange('password')}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="smc-auth__toggle-pw"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {fieldErrors.password && <span className="smc-auth__error-text">{fieldErrors.password}</span>}
            </div>

            <div className={`smc-auth__field${fieldErrors.confirm_password ? ' has-error' : ''}`}>
              <label className="smc-auth__label" htmlFor="reg-confirm_password">
                Confirm Password <span className="smc-auth__req">*</span>
              </label>
              <div className="smc-auth__input-wrap">
                <span className="smc-auth__input-icon"><IconLock /></span>
                <input
                  id="reg-confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="smc-auth__input"
                  placeholder="Repeat password"
                  value={form.confirm_password}
                  onChange={handleChange('confirm_password')}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="smc-auth__toggle-pw"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {fieldErrors.confirm_password && <span className="smc-auth__error-text">{fieldErrors.confirm_password}</span>}
            </div>
          </div>

          <PasswordStrengthBar password={form.password} />

          {/* Terms checkbox */}
          <div className="smc-auth__row">
            <label className="smc-auth__checkbox-label">
              <input
                type="checkbox"
                className="smc-auth__checkbox"
                checked={form.terms}
                onChange={handleChange('terms')}
              />
              <span className="smc-auth__checkbox-custom" />
              <span className="smc-auth__checkbox-text">
                I agree to the <Link to="/terms" className="smc-auth__link-inline">Terms of Service</Link> and <Link to="/privacy" className="smc-auth__link-inline">Privacy Policy</Link>
              </span>
            </label>
          </div>
          {fieldErrors.terms && <span className="smc-auth__error-text">{fieldErrors.terms}</span>}

          {/* Submit Button */}
          <button
            type="submit"
            className="smc-auth__submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <IconSpinner />
                <span>Creating Account…</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span className="smc-auth__btn-arrow">→</span>
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="smc-auth__security-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>Your information is safe and secure with us.</span>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;
