import { Link } from 'react-router-dom';
import authBannerLogin from '../../../assets/auth/auth_banner_login.jpg';
import authBannerSignup from '../../../assets/auth/auth_banner_signup.jpg';

export default function AuthBrandPanel({ activeTab = 'login' }) {
  const isLogin = activeTab === 'login';

  const showcase = isLogin
    ? {
        badge: 'EXECUTIVE SERIES • VINTAGE LEATHER SATCHEL',
        title: 'Carry your ambitions with confidence.',
        sub: 'Handcrafted full-grain leather satchels, laptop messengers & executive briefcases engineered for senior professionals and urban commuters.',
        image: authBannerLogin,
        alt: 'Brand model wearing handcrafted vintage leather messenger bag on shoulder',
        pill: 'Full-Grain Leather Touch • Ergonomic Shoulder Sling',
        testimonial: {
          quote: 'The craftsmanship and weight distribution are unmatched. It feels effortlessly premium throughout long city commutes.',
          author: 'Arjun Mehta',
          role: 'Management Consultant, Mumbai',
        },
      }
    : {
        badge: 'EXECUTIVE TRAVEL • BESPOKE PRIVILEGE',
        title: 'Step into a world of bespoke luxury travel.',
        sub: 'Unlock exclusive member pricing, lifetime warranty coverage, priority dispatch, and personalized embossing across our entire luxury line.',
        image: authBannerSignup,
        alt: 'Brand model with executive leather travel briefcase and luggage in airport lounge',
        pill: 'Airport Friendly • Dedicated Tech Sleeves • TSA Approved',
        testimonial: {
          quote: 'Joining SMC Privilege was the best decision. The travel briefcase and rolling luggage make business flights effortless.',
          author: 'Vikram Malhotra',
          role: 'Managing Director, Bengaluru',
        },
      };

  return (
    <aside className="auth-brand-panel" aria-label="Brand showcase">
      <div className="auth-brand-panel__glow" aria-hidden="true" />
      <div className="auth-brand-panel__grain" aria-hidden="true" />

      {/* Top Brand Header */}
      <div className="auth-brand-panel__top">
        <Link to="/" className="auth-brand-panel__logo-link">
          <div className="auth-brand-panel__logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.2" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="auth-brand-panel__smc-badge">SMC</span>
          </div>
          <div className="auth-brand-panel__logo-text">
            <span className="auth-brand-panel__brand-name">Shree Mahaveer Collections</span>
            <span className="auth-brand-panel__brand-sub">EST. 1998 • VORANO ATELIER</span>
          </div>
        </Link>

        <span className="auth-brand-panel__mode-tag">
          {isLogin ? 'VIP Member Portal' : 'New Member Invitation'}
        </span>
      </div>

      {/* Hero Quote & Showcase Card */}
      <div className="auth-brand-panel__middle">
        <div className="auth-brand-panel__quote-box">
          <span className="auth-brand-panel__eyebrow-badge">{showcase.badge}</span>
          <h2 className="auth-brand-panel__quote-text">
            {showcase.title}
          </h2>
          <p className="auth-brand-panel__quote-sub">
            {showcase.sub}
          </p>
        </div>

        {/* Showcase Image Card with New Dedicated Banner */}
        <div className="auth-brand-panel__showcase">
          <div className="auth-brand-panel__img-frame">
            <img
              src={showcase.image}
              alt={showcase.alt}
              className="auth-brand-panel__img"
              loading="lazy"
            />
            <div className="auth-brand-panel__img-overlay" />
            <div className="auth-brand-panel__img-badge">
              <span className="auth-brand-panel__pulse-dot" />
              <span>{showcase.pill}</span>
            </div>
          </div>

          {/* Testimonial Snippet Card */}
          <div className="auth-brand-panel__testimonial-card">
            <div className="auth-brand-panel__stars" aria-label="5 stars rating">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i} className="auth-brand-panel__star">{star}</span>
              ))}
            </div>
            <p className="auth-brand-panel__testimonial-text">
              &ldquo;{showcase.testimonial.quote}&rdquo;
            </p>
            <div className="auth-brand-panel__testimonial-author">
              <strong>{showcase.testimonial.author}</strong> &bull; <span>{showcase.testimonial.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trust Pillars */}
      <div className="auth-brand-panel__bottom">
        <div className="auth-brand-panel__trust-grid">
          <div className="auth-brand-panel__trust-item">
            <span className="auth-brand-panel__trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <div>
              <p className="auth-brand-panel__trust-title">Reinforced Durability</p>
              <p className="auth-brand-panel__trust-sub">Tested for heavy everyday load</p>
            </div>
          </div>

          <div className="auth-brand-panel__trust-item">
            <span className="auth-brand-panel__trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
            <div>
              <p className="auth-brand-panel__trust-title">100% Secure Checkout</p>
              <p className="auth-brand-panel__trust-sub">256-bit encrypted transactions</p>
            </div>
          </div>

          <div className="auth-brand-panel__trust-item">
            <span className="auth-brand-panel__trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </span>
            <div>
              <p className="auth-brand-panel__trust-title">Pan-India Dispatch</p>
              <p className="auth-brand-panel__trust-sub">Fast, insured doorstep delivery</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
