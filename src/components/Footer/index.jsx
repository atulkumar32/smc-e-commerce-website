import { Link } from 'react-router-dom';
import './style.scss';

const COLLECTIONS = [
  { label: 'School Bags', to: '/products/school-bags' },
  { label: 'Luxury Purses', to: '/products/purses' },
  { label: 'Leather Accessories', to: '/products/wallets' },
  { label: 'New Arrivals', to: '/products/new-arrivals' },
];

const BRAND = [
  { label: 'About Us', to: '/about' },
  { label: 'Craftsmanship', to: '/craftsmanship' },
  { label: 'Sustainability', to: '/sustainability' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
];

const CONCIERGE = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Shipping & Returns', to: '/shipping-returns' },
  { label: 'Care Guide', to: '/care-guide' },
  { label: 'Store Locator', to: '/store-locator' },
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__container">
        {/* Brand Column */}
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__brand-name">
            Shree Mahaveer<br />Collections
          </Link>
          <p className="site-footer__brand-tagline">
            The pinnacle of artisanal heritage and contemporary elegance.
            Handcrafted for those who demand excellence.
          </p>
          <div className="site-footer__brand-icons">
            {/* Globe icon */}
            <a href="#" aria-label="Language / Region" className="site-footer__icon-link">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            </a>
            {/* Share icon */}
            <a href="#" aria-label="Share" className="site-footer__icon-link">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </a>
          </div>
        </div>

        {/* Collections */}
        <div className="site-footer__col">
          <h3 className="site-footer__col-title">COLLECTIONS</h3>
          <ul className="site-footer__col-list">
            {COLLECTIONS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="site-footer__col-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* The Brand */}
        <div className="site-footer__col">
          <h3 className="site-footer__col-title">THE BRAND</h3>
          <ul className="site-footer__col-list">
            {BRAND.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="site-footer__col-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Concierge */}
        <div className="site-footer__col">
          <h3 className="site-footer__col-title">CONCIERGE</h3>
          <ul className="site-footer__col-list">
            {CONCIERGE.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="site-footer__col-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="site-footer__bottom">
        <div className="site-footer__bottom-inner d-flex">
          <p className="site-footer__copyright">
            &copy; 2026 Shree Mahaveer Collections. All Rights Reserved.
          </p>
          <p>v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
