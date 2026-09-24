import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthBrandPanel from './AuthBrandPanel';

export default function AuthLayout({ children, activeTab = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabSwitch = (targetTab) => {
    if (targetTab === activeTab) return;
    const targetPath = targetTab === 'login' ? '/login' : '/register';
    navigate(targetPath, { state: location.state });
  };

  return (
    <div className="auth-shell">
      <div className="auth-shell__container">
        {/* Top utility bar with back-to-store link and concierge help - in line with grid */}
        <header className="auth-shell__utility-bar">
          <Link to="/" className="auth-shell__back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back to Store</span>
          </Link>

          <div className="auth-shell__center-badge">
            <span className="auth-shell__center-dot" />
            <span className="auth-shell__center-text">Official SMC Atelier</span>
          </div>

          <div className="auth-shell__utility-right">
            <Link to="/contact" className="auth-shell__help-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Need Help?</span>
            </Link>
          </div>
        </header>

        {/* Framed Split Card aligned with website container guidelines */}
        <div className="auth-split-layout">
          {/* Left column: Brand & Showcase with activeTab awareness */}
          <AuthBrandPanel activeTab={activeTab} />

          {/* Right column: Authentication Form Container */}
          <main className="auth-form-panel">
            <div className={`auth-form-panel__inner${activeTab === 'register' ? ' auth-form-panel__inner--wide' : ''}`}>
              {/* Mobile / Tablet Brand Header */}
              <div className="auth-form-panel__mobile-brand">
                <Link to="/" className="auth-form-panel__mobile-logo">
                  <div className="auth-brand-panel__logo-icon" style={{ width: 38, height: 38 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.2" aria-hidden="true">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                  </div>
                  <div className="auth-form-panel__mobile-text">
                    <span className="auth-form-panel__mobile-name">Shree Mahaveer Collections</span>
                    <span className="auth-form-panel__mobile-sub">EST. 1998 &bull; VORANO LUXURY ATELIER</span>
                  </div>
                </Link>
              </div>

              {/* Premium Interactive Segmented Tab Switcher */}
              <div className="auth-tabs" role="tablist" aria-label="Authentication Options">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'login'}
                  className={`auth-tab${activeTab === 'login' ? ' is-active' : ''}`}
                  onClick={() => handleTabSwitch('login')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'register'}
                  className={`auth-tab${activeTab === 'register' ? ' is-active' : ''}`}
                  onClick={() => handleTabSwitch('register')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  <span>Create Account</span>
                </button>
              </div>

              {/* Child Form (Login or Register) */}
              <div className="auth-form-panel__card">
                {children}
              </div>
            </div>

            <footer className="auth-form-panel__footer">
              <div className="auth-form-panel__assurance">
                <span className="auth-form-panel__lock-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <span>256-Bit SSL Encrypted &bull; Guaranteed Privacy &bull; Official Portal</span>
              </div>
              <p className="auth-form-panel__copyright">
                &copy; {new Date().getFullYear()} Shree Mahaveer Collections. All rights reserved.
              </p>
              <div className="auth-form-panel__links">
                <Link to="/privacy-policy">Privacy Policy</Link>
                <span className="auth-form-panel__dot">&bull;</span>
                <Link to="/shipping-returns">Terms &amp; Shipping</Link>
                <span className="auth-form-panel__dot">&bull;</span>
                <Link to="/contact">Support Concierge</Link>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
