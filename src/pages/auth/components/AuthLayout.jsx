import { Link } from 'react-router-dom';
import authSchoolBackpack from '../../../assets/auth/auth_school_backpack.jpg';
import '../auth.scss';

export default function AuthLayout({ children, activeTab = 'login' }) {
  const isLogin = activeTab === 'login';

  return (
    <div className="smc-auth">
      <div className="smc-auth__wrapper">
        <div className="smc-auth__card">
          {/* ── LEFT COLUMN: Brand Story & School Backpack Showcase ── */}
          <div className="smc-auth__left">
            {/* Top Row: Brand Identity & Back to School script */}
            <div className="smc-auth__brand-header">
              <Link to="/" className="smc-auth__brand-logo" aria-label="Shree Mahaveer Collections Home">
                <div className="smc-auth__logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <div className="smc-auth__brand-text">
                  <h2 className="smc-auth__brand-name">
                    Shree Mahaveer <span>Collections</span>
                  </h2>
                  <p className="smc-auth__brand-tagline">Quality Bags | Better Tomorrow</p>
                </div>
              </Link>

              <div className="smc-auth__script-badge" aria-hidden="true">
                <span className="smc-auth__script-text">Back to School</span>
                <svg className="smc-auth__script-swoosh" viewBox="0 0 100 20" fill="none">
                  <path d="M5 12C30 4 70 3 95 14" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M20 17C45 11 75 11 90 18" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Headline & Subtitle */}
            <div className="smc-auth__hero-text">
              <h1 className="smc-auth__hero-title">
                Smart Bags for <span className="smc-auth__highlight">Bright Futures</span>
              </h1>
              <p className="smc-auth__hero-subtitle">
                Premium quality school bags designed for comfort, durability and style.
              </p>
            </div>

            {/* 3 Circular Feature Badges */}
            <div className="smc-auth__features-row">
              <div className="smc-auth__feature-item">
                <div className="smc-auth__feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <span className="smc-auth__feature-label">Durable<br />Quality</span>
              </div>

              <div className="smc-auth__feature-item">
                <div className="smc-auth__feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                    <line x1="16" y1="8" x2="2" y2="22" />
                    <line x1="17.5" y1="15" x2="9" y2="15" />
                  </svg>
                </div>
                <span className="smc-auth__feature-label">Lightweight<br />Design</span>
              </div>

              <div className="smc-auth__feature-item">
                <div className="smc-auth__feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span className="smc-auth__feature-label">Trendy<br />Styles</span>
              </div>
            </div>

            {/* School Backpack Hero Photo with Blue Accent Wave */}
            <div className="smc-auth__visual-container">
              <div className="smc-auth__wave-decor" aria-hidden="true" />
              <img
                src={authSchoolBackpack}
                alt="Shree Mahaveer modern blue school backpack with books and water bottle on campus"
                className="smc-auth__backpack-photo"
              />
            </div>
          </div>

          {/* ── RIGHT COLUMN: Authentication Form ── */}
          <div className="smc-auth__right">
            {/* Top Switcher Link */}
            <div className="smc-auth__switch-bar">
              {isLogin ? (
                <span>
                  New Account?{' '}
                  <Link to="/register" className="smc-auth__switch-link">
                    Create Account
                  </Link>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <Link to="/login" className="smc-auth__switch-link">
                    Sign In
                  </Link>
                </span>
              )}
            </div>

            {/* Form Slot */}
            <div className="smc-auth__form-container">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
