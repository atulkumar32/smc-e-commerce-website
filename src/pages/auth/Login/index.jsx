import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userLoginAction } from '../../../Actions/AuthAction';
import { saveUserAuth, isUserAuthenticated } from '../../../services/apiClients';
import { validateLoginForm, hasErrors } from '../../../utils/validators';
import { toast } from 'react-toastify';

import AuthLayout from '../components/AuthLayout';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import '../auth.scss';

// SVG Mail Icon
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

// SVG Lock Icon
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

// SVG Eye Icons
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

// SVG Spinner Icon
const IconSpinner = () => (
  <svg className="smc-auth__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" aria-hidden="true">
    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
  </svg>
);

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const rawFrom = location.state?.from;
  const returnTo =
    (typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname) || '/user/dashboard';
  const redirectState = location.state?.selectedProduct
    ? {
        selectedProduct: location.state.selectedProduct,
        checkoutMode: location.state.checkoutMode,
      }
    : undefined;

  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isUserAuthenticated()) {
      navigate(returnTo, { replace: true, state: redirectState });
    }
  }, [navigate, returnTo, redirectState]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setGeneralError('');
  };

  // Quick Demo fill
  const handleQuickFill = () => {
    setForm({
      email: 'smc.user@gmail.com',
      password: 'Password@123',
    });
    setFieldErrors({});
    setGeneralError('');
  };

  const handleGoogleSignIn = () => {
    toast.info('Google Sign-In is opening for school accounts...');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validateLoginForm(form);
    if (hasErrors(errs)) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      const data = await userLoginAction(form);
      const saved = saveUserAuth(data);
      if (!saved) {
        throw new Error('Failed to initialize session. Please try again.');
      }

      toast.success('Welcome back! Signed in successfully.');
      navigate(returnTo, { replace: true, state: redirectState });
    } catch (err) {
      const msg = err.message || 'Invalid email or password. Please try again.';
      setGeneralError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout activeTab="login">
      <div className="smc-auth__login-box">
        <div className="smc-auth__heading-group">
          <h2 className="smc-auth__title">Welcome Back</h2>
          <p className="smc-auth__subtitle">
            Sign in to your account to continue shopping with Shree Mahaveer Collections
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

        <form className="smc-auth__form" onSubmit={handleSubmit} noValidate>
          {/* Email Address */}
          <div className={`smc-auth__field${fieldErrors.email ? ' has-error' : ''}`}>
            <label className="smc-auth__label" htmlFor="login-email">
              Email Address
            </label>
            <div className="smc-auth__input-wrap">
              <span className="smc-auth__input-icon">
                <IconMail />
              </span>
              <input
                id="login-email"
                type="email"
                className="smc-auth__input"
                placeholder="e.g. john@example.com"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            {fieldErrors.email && (
              <span className="smc-auth__error-text">{fieldErrors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className={`smc-auth__field${fieldErrors.password ? ' has-error' : ''}`}>
            <label className="smc-auth__label" htmlFor="login-password">
              Password
            </label>
            <div className="smc-auth__input-wrap">
              <span className="smc-auth__input-icon">
                <IconLock />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="smc-auth__input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="current-password"
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
            {fieldErrors.password && (
              <span className="smc-auth__error-text">{fieldErrors.password}</span>
            )}
          </div>

          {/* Remember me & Forgot password */}
          <div className="smc-auth__row">
            <label className="smc-auth__checkbox-label">
              <input
                type="checkbox"
                className="smc-auth__checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="smc-auth__checkbox-custom" />
              <span className="smc-auth__checkbox-text">Remember me</span>
            </label>

            <button
              type="button"
              className="smc-auth__forgot-link"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="smc-auth__submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <IconSpinner />
                <span>Signing In…</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="smc-auth__btn-arrow">→</span>
              </>
            )}
          </button>

          {/* Quick Demo Credentials button for testing */}
          <div className="smc-auth__demo-row">
            <button
              type="button"
              className="smc-auth__demo-btn"
              onClick={handleQuickFill}
            >
              ⚡ Fill Demo Account Credentials
            </button>
          </div>

          {/* OR Divider */}
          <div className="smc-auth__divider">
            <span className="smc-auth__divider-line" />
            <span className="smc-auth__divider-text">OR</span>
            <span className="smc-auth__divider-line" />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            className="smc-auth__google-btn"
            onClick={handleGoogleSignIn}
          >
            <IconGoogle />
            <span>Continue with Google</span>
          </button>

          {/* Security Assurance */}
          <div className="smc-auth__security-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>Your information is safe and secure with us.</span>
          </div>
        </form>
      </div>

      <ForgotPasswordModal
        open={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </AuthLayout>
  );
}

export default LoginPage;
