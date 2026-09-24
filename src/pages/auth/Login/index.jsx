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
  const [rememberMe, setRememberMe] = useState(true);
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

  // Quick Demo fill for convenience
  const handleQuickFill = () => {
    setForm({
      email: 'customer@shreemahaveer.com',
      password: 'Password@123',
    });
    setFieldErrors({});
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
      // 2. Call backend authentication
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
        <div className="auth-header__badge-row">
          <span className="auth-header__badge">
            <span className="auth-header__badge-pulse" />
            VIP Member Access
          </span>
          <button
            type="button"
            className="auth-header__demo-btn"
            onClick={handleQuickFill}
            title="Auto-fill sample credentials for rapid preview"
          >
            ⚡ Quick Demo Fill
          </button>
        </div>
        <h1 className="auth-header__title">Sign In to SMC</h1>
        <p className="auth-header__sub">
          Enter your credentials to access your bespoke orders, tracking, and wishlist.
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
      <form onSubmit={handleSubmit} noValidate className="auth-form">
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

        {/* Remember Me & Security info */}
        <div className="auth-form__extra-row">
          <label className="auth-form__remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <span>Remember this device</span>
          </label>
        </div>

        {/* Submit Button with Sweeping Sheen Animation */}
        <button
          type="submit"
          className="auth-btn auth-btn--primary auth-btn--sheen"
          disabled={loading}
        >
          <span className="auth-btn__sheen-sweep" aria-hidden="true" />
          {loading ? (
            <>
              <IconSpinner />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Your Account</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <p className="auth-card-switch">
        New to Shree Mahaveer Collections?
        <Link to="/register" state={location.state} className="auth-card-switch__link">
          <span>Create an Account</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <polyline points="9 18 15 12 9 6" />
          </svg>
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
