import { Link } from 'react-router-dom';
import AuthBrandPanel from './AuthBrandPanel';

export default function AuthLayout({ children, activeTab = 'login' }) {
  return (
    <div className="auth-shell">
      {/* Top utility bar with back-to-store link */}
      <div className="auth-shell__utility-bar">
        <Link to="/" className="auth-shell__back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back to Store</span>
        </Link>

        {/* Quick switcher for tablet/mobile */}
        <div className="auth-shell__quick-switch">
          {activeTab === 'login' ? (
            <span>New here? <Link to="/register" className="auth-shell__switch-link">Create Account</Link></span>
          ) : (
            <span>Already a member? <Link to="/login" className="auth-shell__switch-link">Sign In</Link></span>
          )}
        </div>
      </div>

      <div className="auth-split-layout">
        {/* Left column: Brand & Showcase */}
        <AuthBrandPanel />

        {/* Right column: Authentication Form Container */}
        <main className="auth-form-panel">
          <div className="auth-form-panel__inner">
            {/* Mobile-only logo */}
            <div className="auth-form-panel__mobile-brand">
              <Link to="/" className="auth-form-panel__mobile-logo">
                <div className="auth-brand-panel__logo-icon" style={{ width: 34, height: 34 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.2" aria-hidden="true">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <span className="auth-form-panel__mobile-name">Shree Mahaveer Collections</span>
              </Link>
            </div>

            {children}
          </div>

          <footer className="auth-form-panel__footer">
            <p className="auth-form-panel__copyright">
              © {new Date().getFullYear()} Shree Mahaveer Collections. All rights reserved.
            </p>
            <div className="auth-form-panel__links">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <span className="auth-form-panel__dot">•</span>
              <Link to="/shipping-returns">Terms &amp; Shipping</Link>
              <span className="auth-form-panel__dot">•</span>
              <Link to="/contact">Support</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

