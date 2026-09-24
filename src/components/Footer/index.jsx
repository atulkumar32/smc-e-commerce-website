import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { isUserAuthenticated } from '../../services/apiClients';
import './style.scss';

// ── SVG Social & Contact icons ─────────────────────────────────
const Ig  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>;
const Fb  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>;
const Yt  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22.5 6.3a2.8 2.8 0 00-2-2C18.9 4 12 4 12 4s-6.9 0-8.5.3a2.8 2.8 0 00-2 2A29 29 0 001 12a29 29 0 00.5 5.7 2.8 2.8 0 002 2C5.1 20 12 20 12 20s6.9 0 8.5-.3a2.8 2.8 0 002-2A29 29 0 0023 12a29 29 0 00-.5-5.7z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>;
const Pin = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"/></svg>;

const PhoneIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 01-2.2 2A19.8 19.8 0 013.1 5.2 2 2 0 015.1 3h3a2 2 0 012 1.7 12.8 12.8 0 00.7 2.8 2 2 0 01-.5 2.1l-1.3 1.3a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5 12.8 12.8 0 002.8.7A2 2 0 0122 16.9z"/></svg>;
const MailIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const LocIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ArrowIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

// ── Mobile Bottom Nav Stroke Icons (Matching User Reference Image) ──
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

const ShopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.16"/>
  </svg>
);

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const WishlistIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const AccountIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SHOP_LINKS = [
  { label: 'School Bags',  to: '/products?category_name=School+Bags' },
  { label: 'Backpacks',    to: '/products?category_name=Backpacks' },
  { label: 'Laptop Bags',  to: '/products?category_name=Laptop+Bags' },
  { label: 'Ladies Bags',  to: '/products?category_name=Ladies+Bags' },
  { label: 'Sling Bags',   to: '/products?category_name=Sling+Bags' },
  { label: 'Travel Bags',  to: '/products?category_name=Travel+Bags' },
  { label: 'New Arrivals', to: '/products/new-arrivals' },
];

const HELP_LINKS = [
  { label: 'Track Order',       to: '/contact' },
  { label: 'Shipping Policy',   to: '/shipping-returns' },
  { label: 'Returns & Refunds', to: '/shipping-returns' },
  { label: 'FAQ',               to: '/contact' },
  { label: 'Contact Us',        to: '/contact' },
];

const ABOUT_LINKS = [
  { label: 'Our Story',      to: '/about' },
  { label: 'Why SMC',        to: '/craftsmanship' },
  { label: 'Sustainability', to: '/sustainability' },
  { label: 'Blog',           to: '/about' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
];

function Footer() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { totalItems, wishlistCount } = useCart();
  const { openDrawer } = useCartDrawer();
  const isAuthenticated = isUserAuthenticated();

  const [email, setEmail] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Close search drawer on route changes
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  // Autofocus input when search drawer is opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email.trim()) setEmail('');
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <footer className="v-footer">
      <div className="v-footer__grid">

        {/* ── Brand column ── */}
        <div className="v-footer__brand">
          <Link to="/home" className="v-footer__logo">
            SHREE MAHAVEER
            <small>COLLECTIONS</small>
          </Link>
          <p className="v-footer__tagline">
            Bags for a Brighter Tomorrow.<br />
            Stylish. Functional. For Every Journey.
          </p>
          <div className="v-footer__social">
            <a href="#" aria-label="Instagram"><Ig /></a>
            <a href="#" aria-label="Facebook"><Fb /></a>
            <a href="#" aria-label="YouTube"><Yt /></a>
            <a href="#" aria-label="Pinterest"><Pin /></a>
          </div>
        </div>

        {/* ── Shop ── */}
        <div className="v-footer__col">
          <h4>Shop</h4>
          {SHOP_LINKS.map(({ label, to }) => (
            <Link key={label} to={to}>{label}</Link>
          ))}
        </div>

        {/* ── Help ── */}
        <div className="v-footer__col">
          <h4>Help</h4>
          {HELP_LINKS.map(({ label, to }) => (
            <Link key={label} to={to}>{label}</Link>
          ))}
        </div>

        {/* ── About ── */}
        <div className="v-footer__col">
          <h4>About</h4>
          {ABOUT_LINKS.map(({ label, to }) => (
            <Link key={label} to={to}>{label}</Link>
          ))}
        </div>

        {/* ── Contact + Newsletter ── */}
        <div className="v-footer__col">
          <h4>Contact</h4>
          <div className="v-footer__contact-row">
            <PhoneIcon />
            <span>+91 98765 43210</span>
          </div>
          <div className="v-footer__contact-row">
            <MailIcon />
            <span>support@shreemahaveer.in</span>
          </div>
          <div className="v-footer__contact-row">
            <LocIcon />
            <span>Noida, Uttar Pradesh, India</span>
          </div>

          <h4 style={{ marginTop: '20px' }}>Newsletter</h4>
          <p className="v-footer__nl-sub">Get exclusive offers &amp; new arrivals.</p>
          <form onSubmit={handleNewsletter} className="v-footer__newsletter">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Newsletter email"
            />
            <button type="submit" aria-label="Subscribe">
              <ArrowIcon />
            </button>
          </form>
        </div>

      </div>

      {/* ── Copyright ── */}
      <div className="v-footer__bottom">
        <div className="v-footer__bottom-inner">
          <span>© 2026 Shree Mahaveer Collections. All rights reserved.</span>
          <span>
            <Link to="/privacy-policy" style={{ color: '#666', textDecoration: 'none' }}>Privacy Policy</Link>
            &nbsp;|&nbsp;
            <Link to="/shipping-returns" style={{ color: '#666', textDecoration: 'none' }}>Terms</Link>
          </span>
          <span>Made with ❤️ in India</span>
        </div>
      </div>

      {/* ═══ MOBILE / TABLET FIXED BOTTOM NAVIGATION BAR ══════════════ */}
      {/* Visible ONLY on tablet & mobile devices (≤900px), matching reference design */}
      <nav className="v-mobile-nav" aria-label="Mobile bottom navigation">
        {/* Quick Search Slide-Up Popover */}
        {searchOpen && (
          <div className="v-mobile-nav__search-popover">
            <form onSubmit={handleMobileSearch} className="v-mobile-nav__search-form" role="search">
              <span className="v-mobile-nav__search-icon" aria-hidden="true">
                <SearchIcon size={16} />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search bags, backpacks, laptop gear…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Mobile search"
              />
              {searchQuery.trim() && (
                <button
                  type="button"
                  className="v-mobile-nav__search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
              <button type="submit" className="v-mobile-nav__search-submit" aria-label="Submit search">
                <ArrowIcon />
              </button>
              <button
                type="button"
                className="v-mobile-nav__search-close"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search popover"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="v-mobile-nav__bar">
          {/* 1. HOME */}
          <NavLink
            to="/home"
            className={({ isActive }) => `v-mobile-nav__item${isActive ? ' is-active' : ''}`}
            aria-label="Home"
          >
            <HomeIcon />
            <span className="lbl">HOME</span>
          </NavLink>

          {/* 2. SHOP */}
          <NavLink
            to="/products"
            className={({ isActive }) => `v-mobile-nav__item${isActive ? ' is-active' : ''}`}
            aria-label="Shop products"
          >
            <ShopIcon />
            <span className="lbl">SHOP</span>
          </NavLink>

          {/* 3. SEARCH */}
          <button
            type="button"
            className={`v-mobile-nav__item${searchOpen ? ' is-active' : ''}`}
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
          >
            <SearchIcon />
            <span className="lbl">SEARCH</span>
          </button>

          {/* 4. WISHLIST */}
          <NavLink
            to="/wishlist"
            className={({ isActive }) => `v-mobile-nav__item${isActive ? ' is-active' : ''}`}
            aria-label="Wishlist"
          >
            <div className="v-mobile-nav__icon-wrap">
              <WishlistIcon />
              {wishlistCount > 0 && (
                <span className="v-mobile-nav__badge">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </div>
            <span className="lbl">WISHLIST</span>
          </NavLink>

          {/* 5. BAG */}
          <button
            type="button"
            className="v-mobile-nav__item"
            onClick={openDrawer}
            aria-label="Shopping Cart Bag"
          >
            <div className="v-mobile-nav__icon-wrap">
              <BagIcon />
              {totalItems > 0 && (
                <span className="v-mobile-nav__badge">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </div>
            <span className="lbl">BAG</span>
          </button>

          {/* 6. ACCOUNT */}
          <NavLink
            to={isAuthenticated ? '/user/dashboard' : '/login'}
            className={({ isActive }) => `v-mobile-nav__item${isActive ? ' is-active' : ''}`}
            aria-label={isAuthenticated ? 'User Account' : 'Login'}
          >
            <AccountIcon />
            <span className="lbl">ACCOUNT</span>
          </NavLink>
        </div>
      </nav>
    </footer>
  );
}

export default Footer;
