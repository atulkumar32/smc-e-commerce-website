import { Link } from 'react-router-dom';
import bannerImg from '../../../assets/homeimages/banner_1.png';

export default function AuthBrandPanel() {
  return (
    <aside className="auth-brand-panel" aria-label="Brand showcase">
      <div className="auth-brand-panel__glow" aria-hidden="true" />

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
            <span className="auth-brand-panel__brand-sub">VORANO INDIA</span>
          </div>
        </Link>
      </div>

      {/* Hero Quote & Showcase Card */}
      <div className="auth-brand-panel__middle">
        <div className="auth-brand-panel__quote-box">
          <span className="auth-brand-panel__quote-mark">“</span>
          <h2 className="auth-brand-panel__quote-text">
            Designed for every journey,<br />
            built for everyday confidence.
          </h2>
          <p className="auth-brand-panel__quote-sub">
            Luxury school bags, backpacks &amp; travel gear engineered for uncompromising durability and ergonomic comfort.
          </p>
        </div>

        {/* Showcase Image Card */}
        <div className="auth-brand-panel__showcase">
          <div className="auth-brand-panel__img-frame">
            <img
              src={bannerImg}
              alt="Premium Shree Mahaveer School Bags Collection"
              className="auth-brand-panel__img"
              loading="lazy"
            />
            <div className="auth-brand-panel__img-overlay" />
            <div className="auth-brand-panel__img-badge">
              <span className="auth-brand-panel__pulse-dot" />
              <span>Handcrafted Excellence • Water Resistant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trust Pillars & Social Proof */}
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

        {/* Rating proof */}
        <div className="auth-brand-panel__social-proof">
          <div className="auth-brand-panel__stars" aria-label="5 star rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <svg key={n} viewBox="0 0 24 24" fill="#D4AF37" width="13" height="13">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span className="auth-brand-panel__proof-text">
            <strong>4.9 / 5</strong> rating from 10,000+ students &amp; parents
          </span>
        </div>
      </div>
    </aside>
  );
}

