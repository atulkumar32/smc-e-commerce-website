import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { isUserAuthenticated, getUserProfile } from '../../services/apiClients';
import './style.scss';

// ── Static nav links ──────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Home',         to: '/home' },
  { label: 'School Bags',  to: '/products?category_name=School+Bags' },
  { label: 'Backpacks',    to: '/products?category_name=Backpacks' },
  { label: 'Laptop Bags',  to: '/products?category_name=Laptop+Bags' },
  { label: 'Ladies Bags',  to: '/products?category_name=Ladies+Bags' },
  { label: 'Sling Bags',   to: '/products?category_name=Sling+Bags' },
  { label: 'Travel Bags',  to: '/products?category_name=Travel+Bags' },
  { label: 'New Arrivals', to: '/products/new-arrivals' },
];

// ── Refined Luxury Stroke Icons (14px - 19px) ─────────────────
const HeartIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const UserIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CartIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const SearchIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.5 6.3a2.8 2.8 0 00-2-2C18.9 4 12 4 12 4s-6.9 0-8.5.3a2.8 2.8 0 00-2 2A29 29 0 001 12a29 29 0 00.5 5.7 2.8 2.8 0 002 2C5.1 20 12 20 12 20s6.9 0 8.5-.3a2.8 2.8 0 002-2A29 29 0 0023 12a29 29 0 00-.5-5.7z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
  </svg>
);

export default function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { totalItems, wishlistCount } = useCart();
  const { openDrawer } = useCartDrawer();

  const [query,          setQuery]          = useState('');
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [authTick,       setAuthTick]       = useState(0);

  useEffect(() => {
    const handleAuth = () => setAuthTick((t) => t + 1);
    window.addEventListener('authChange', handleAuth);
    return () => window.removeEventListener('authChange', handleAuth);
  }, []);

  const isAuthenticated = isUserAuthenticated();
  const userProfile     = getUserProfile();
  const userDisplayName = userProfile?.name ? userProfile.name.split(' ')[0] : 'Account';

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Track window scroll progress for brand theme progress bar
  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        setScrollProgress(0);
      } else {
        const pct = Math.min(100, Math.max(0, (scrollY / scrollHeight) * 100));
        setScrollProgress(pct);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setMobileOpen(false);
    }
  }, [query, navigate]);

  return (
    <>
      {/* ═══ SCROLL PROGRESS BAR (Top of Header) ══════════════ */}
      <div className="v-scroll-progress" aria-hidden="true">
        <div
          className="v-scroll-progress__bar"
          style={{ width: `${scrollProgress}%` }}
        >
          {scrollProgress > 0 && <span className="v-scroll-progress__glow" />}
        </div>
      </div>

      {/* ═══ TOP BAR ═══════════════════════════════════════════ */}
      <div className="v-topbar">
        <div className="v-topbar__inner">
          <div className="v-topbar__left">
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Free Shipping on Orders Above ₹999
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
              Easy Returns within 7 Days
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              100% Secure Payments
            </span>
          </div>
          <div className="v-topbar__right">
            <span>Follow Us</span>
            <a href="#" aria-label="Instagram"><InstagramIcon /></a>
            <a href="#" aria-label="Facebook"><FacebookIcon /></a>
            <a href="#" aria-label="YouTube"><YoutubeIcon /></a>
          </div>
        </div>
      </div>

      {/* ═══ MAIN HEADER ═══════════════════════════════════════ */}
      <header className="v-header">
        <div className="v-header__inner">
          {/* Logo */}
          <Link to="/home" className="v-logo" aria-label="Shree Mahaveer Collections Home">
            SHREE MAHAVEER
            <small>COLLECTIONS</small>
          </Link>

          {/* Search */}
          <form className="v-search" onSubmit={handleSearch} role="search">
            <span className="v-search__lead" aria-hidden="true">
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search school bags, backpacks, travel gear…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            {query.trim() && (
              <button
                type="button"
                className="v-search__clear"
                onClick={() => setQuery('')}
                aria-label="Clear search input"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
            <button type="submit" className="v-search__btn" aria-label="Submit search">
              <ArrowRightIcon />
            </button>
          </form>

          {/* Actions */}
          <div className="v-hdr-acts">
            <NavLink
              to={isAuthenticated ? "/user/dashboard" : "/login"}
              className="v-hdr-act"
              aria-label={isAuthenticated ? "User Account" : "Login"}
            >
              <UserIcon />
              <span className="lbl">{isAuthenticated ? userDisplayName : 'Login'}</span>
            </NavLink>

            <NavLink to="/wishlist" className="v-hdr-act" aria-label="Wishlist">
              <div className="v-hdr-act__icon-wrap">
                <HeartIcon />
                {wishlistCount > 0 && (
                  <span className="v-badge">{wishlistCount > 99 ? '99+' : wishlistCount}</span>
                )}
              </div>
              <span className="lbl">Wishlist</span>
            </NavLink>

            <button className="v-hdr-act" onClick={openDrawer} aria-label="Shopping Cart" type="button">
              <div className="v-hdr-act__icon-wrap">
                <CartIcon />
                {totalItems > 0 && (
                  <span className="v-badge">{totalItems > 99 ? '99+' : totalItems}</span>
                )}
              </div>
              <span className="lbl">Cart</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`v-ham${mobileOpen ? ' v-ham--open' : ''}`}
            onClick={() => setMobileOpen(p => !p)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span/><span/><span/>
          </button>
        </div>
      </header>

      {/* ═══ NAV BAR ════════════════════════════════════════════ */}
      <nav className="v-nav" aria-label="Main navigation">
        <ul className="v-nav__inner">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `v-nav__link${isActive ? ' v-nav__link--active' : ''}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ═══ MOBILE DRAWER ══════════════════════════════════════ */}
      {mobileOpen && (
        <div
          className="v-drawer-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className={`v-drawer${mobileOpen ? ' v-drawer--open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="v-drawer__head">
          <Link to="/home" className="v-logo" style={{ fontSize: 18, textAlign: 'left' }}
            onClick={() => setMobileOpen(false)}>
            SHREE MAHAVEER<small style={{ letterSpacing: 3 }}>COLLECTIONS</small>
          </Link>
          <button className="v-drawer__close" onClick={() => setMobileOpen(false)}>×</button>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} style={{ padding: '12px 18px' }}>
          <div className="v-search v-search--mobile" style={{ maxWidth: '100%', height: 42 }}>
            <span className="v-search__lead" aria-hidden="true">
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query.trim() && (
              <button
                type="button"
                className="v-search__clear"
                onClick={() => setQuery('')}
                aria-label="Clear search input"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
            <button type="submit" className="v-search__btn" aria-label="Submit search">
              <ArrowRightIcon />
            </button>
          </div>
        </form>

        <div className="v-drawer__hr" />

        {NAV_LINKS.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `v-drawer__link${isActive ? ' v-drawer__link--active' : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </NavLink>
        ))}

        <div className="v-drawer__hr" />

        <NavLink
          to={isAuthenticated ? "/user/dashboard" : "/login"}
          className="v-drawer__link"
          onClick={() => setMobileOpen(false)}
        >
          <UserIcon />
          <span>{isAuthenticated ? `${userDisplayName}'s Account` : 'Login / Register'}</span>
        </NavLink>
        <NavLink to="/wishlist" className="v-drawer__link" onClick={() => setMobileOpen(false)}>
          <HeartIcon />
          <span>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
        </NavLink>
        <NavLink to="/cart" className="v-drawer__link" onClick={() => setMobileOpen(false)}>
          <CartIcon />
          <span>Cart {totalItems > 0 ? `(${totalItems})` : ''}</span>
        </NavLink>
      </nav>
    </>
  );
}

/*
 * OLD DESIGN preserved below — comment block for reference
 * ─────────────────────────────────────────────────────────
 * Previous implementation used:
 *   hdr-topbar, hdr-inner, hdr-brand, hdr-tiers, hdr-tier,
 *   hdr-search, hdr-acts, hdr-act, hdr-cart, hdr-ham,
 *   hdr-cats (category strip), hdr-cat, hdr-drawer
 * All those classes are now superseded by v-* prefixed classes.
 */
