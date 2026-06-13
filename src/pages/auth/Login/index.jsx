import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userLoginAction } from '../../../Actions/AuthAction';
import { saveUserAuth } from '../../../services/apiClients';
import { validateLoginForm, hasErrors } from '../../../utils/validators';
import { toast } from 'react-toastify';
import './style.scss';

// ── SVG icons (no MUI dependency) ─────────────────────────────────────────────
const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const IconEye = ({ off }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const IconSpin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    aria-hidden="true" className="auth-spin">
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

// ── Background image ──────────────────────────────────────────────────────────
const BG_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwyI-VTgFJ4OPG6G070NRu50x-vuatciHQ3EShXqVclUZ4QGzIbT7aOhbFQox3iOO5TKRKvD7YH4LpOd8aAfC5HJXP87jazOvxPNRlnvz0pGSzyTGIBjZl5Ct86ibcG6nWuVR6sPoIi-Kq8yXAQRmnmjWrgI18cdsbSTw6PlWDeIPZGpNpYaplJM5KAK_q2zk0CzadNkQ97YfMtsA1HVDyyQX4ON6FqWVq-NxPmi4OqXlZvRob6JRdL5P64oxRvE-JFtioTZwlCVA';

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
  const [form, setForm]               = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLoginForm(form);
    if (hasErrors(errs)) {
      setError(Object.values(errs)[0]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await userLoginAction(form);
      saveUserAuth(data);
      toast.success('✅ Signed in successfully!', { position: 'top-right', autoClose: 2500 });
      navigate(returnTo, { replace: true, state: redirectState });
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(`❌ ${msg}`, { position: 'top-right', autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Atmospheric side image */}
      <div className="auth-page__bg-panel" aria-hidden="true">
        <img src={BG_IMG} alt="" className="auth-page__bg-img" />
        <div className="auth-page__bg-overlay" />
      </div>

      <div className="auth-page__content">
        {/* Brand header */}
        <header className="auth-page__header">
          <Link to="/" className="auth-page__brand">MAJESTIC HERITAGE</Link>
        </header>

        <main className="auth-page__main">
          <div className="auth-card">
            {/* Welcome */}
            <div className="auth-card__welcome">
              <h1 className="auth-card__headline">Welcome Back</h1>
              <p className="auth-card__sub">
                Sign in to continue your artisanal journey with Shree Mahaveer Collections.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="auth-card__error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="auth-form__field">
                <label className="auth-form__label" htmlFor="login-email">
                  Email Address
                </label>
                <div className="auth-form__input-wrap">
                  <span className="auth-form__icon"><IconMail /></span>
                  <input
                    id="login-email"
                    type="email"
                    className="auth-form__input"
                    placeholder="email@heritage.com"
                    value={form.email}
                    onChange={set('email')}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-form__field">
                <div className="auth-form__label-row">
                  <label className="auth-form__label" htmlFor="login-pwd">Password</label>
                  <a href="#" className="auth-form__forgot">Forgot Password?</a>
                </div>
                <div className="auth-form__input-wrap">
                  <span className="auth-form__icon"><IconLock /></span>
                  <input
                    id="login-pwd"
                    type={showPwd ? 'text' : 'password'}
                    className="auth-form__input auth-form__input--padded-r"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set('password')}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-form__eye"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    <IconEye off={showPwd} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="auth-btn auth-btn--gold"
                disabled={loading}
              >
                {loading ? <><IconSpin /> Signing in…</> : 'Login'}
              </button>

              {/* Divider */}
              <div className="auth-divider"><span>Or continue with</span></div>

              {/* Social */}
              <div className="auth-social">
                <button type="button" className="auth-social__btn">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuARbntyRKJYJ10YCDyygtA_v8mKYTWqCLQ_0Hjub_iZSCX7jPEJ2oVYWTFF808uZx9Xj2Kjd2Cy_kB86vquOSQT5yfNIKjJlRwTzxxmo3JrWQRYEjE3Fk01VlAogJR7mHGoGu_QD4Ydhdg1CjZhvq0DSwOGNN5K00xR4OiJxcgEwOZCWBqFx80Ih6ZQmaP8AR_qUpk9lGSVNmMjWYIYU8gQtO3a7siYp1TSJBVl5vuS4Izez1FBM646BNIbsPctawkcacbyqryrtrk"
                    alt="Google" width="20" height="20" />
                  Google
                </button>
                <button type="button" className="auth-social__btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Apple
                </button>
              </div>
            </form>

            {/* Sign up link */}
            <p className="auth-card__footer-text">
              New to Mahaveer?{' '}
              <Link to="/register" className="auth-card__footer-link">Create Account</Link>
            </p>
          </div>
        </main>

        <footer className="auth-page__footer">
          <p>© 2024 MAJESTIC HERITAGE. ALL RIGHTS RESERVED.</p>
          <div className="auth-page__footer-links">
            <Link to="/craftsmanship">Craftsmanship</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LoginPage;
