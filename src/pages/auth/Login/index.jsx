import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userLoginAction } from '../../../Actions/AuthAction';
import { saveUserAuth } from '../../../services/apiClients';
import { validateLoginForm, hasErrors } from '../../../utils/validators';
import { toast } from 'react-toastify';

import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import PasswordInput from '../components/PasswordInput';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import './style.scss';

// SVG Mail Icon
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

// SVG Spinner Icon
const IconSpinner = () => (
  <svg className="auth-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" aria-hidden="true">
    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
  </svg>
);

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.from || '/user/dashboard';
  const redirectState = location.state?.selectedProduct
    ? {
        selectedProduct: location.state.selectedProduct,
        checkoutMode: location.state.checkoutMode,
      }
    : undefined;

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client validation
    const errs = validateLoginForm(form);
    if (hasErrors(errs)) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      // 2. Call existing backend authentication
      const data = await userLoginAction(form);
      saveUserAuth(data);

      toast.success('Welcome back! Signed in successfully.', {
        position: 'top-right',
        autoClose: 2500,
      });

      // 3. Navigate back to destination or user portal
      navigate(returnTo, { replace: true, state: redirectState });
    } catch (err) {
      console.error('[Login] Error:', err);
      const rawMsg = err.message || '';
      let friendlyMsg = 'Invalid email or password. Please verify your credentials and try again.';
      if (rawMsg.toLowerCase().includes('network') || rawMsg.toLowerCase().includes('failed to fetch')) {
        friendlyMsg = 'Unable to connect to the server. Please check your internet connection.';
      } else if (rawMsg) {
        friendlyMsg = rawMsg;
      }

      setGeneralError(friendlyMsg);
      toast.error(friendlyMsg, { position: 'top-right', autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout activeTab="login">
      {/* Auth Card Header */}
      <div className="auth-header">
        <span className="auth-header__badge">Verified Customer Access</span>
        <h1 className="auth-header__title">Welcome Back 👋</h1>
        <p className="auth-header__sub">
          Access your orders, wishlist and personalized shopping experience.
        </p>
      </div>

      {/* General error alert */}
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

      {/* Authentication Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Email Address */}
        <AuthInput
          id="login-email"
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

        {/* Password */}
        <PasswordInput
          id="login-password"
          label="Password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange('password')}
          error={fieldErrors.password}
          required
          autoComplete="current-password"
          disabled={loading}
          actionLink={
            <button
              type="button"
              className="auth-forgot-link"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </button>
          }
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="auth-btn auth-btn--primary"
          disabled={loading}
          style={{ marginTop: '0.75rem' }}
        >
          {loading ? (
            <>
              <IconSpinner />
              <span>Logging in...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <p className="auth-card-switch">
        Don&apos;t have an account?
        <Link to="/register" className="auth-card-switch__link">
          Create Account
        </Link>
      </p>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </AuthLayout>
  );
}

export default LoginPage;

/*
 ==============================================================================
  PREVIOUS LOGIN IMPLEMENTATION (PRESERVED FOR HISTORICAL REFERENCE)
 ==============================================================================

function LegacyLoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-page__bg-panel">
        <img src="legacy-bg.jpg" alt="" className="auth-page__bg-img" />
      </div>
      <div className="auth-page__content">
        <Link to="/" className="auth-page__brand">MAJESTIC HERITAGE</Link>
      </div>
    </div>
  );
}
*/
